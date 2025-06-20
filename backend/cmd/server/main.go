package main

import (
	"log"
	"yummio-backend/internal/config"
	"yummio-backend/internal/database"
	"yummio-backend/internal/handlers"
	"yummio-backend/internal/middleware"
	"yummio-backend/internal/repositories"
	"yummio-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Yummio Recipe API
// @version 1.0
// @description A comprehensive recipe management API for the Yummio mobile application
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.yummio.com/support
// @contact.email support@yummio.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	recipeRepo := repositories.NewRecipeRepository(db)
	collectionRepo := repositories.NewCollectionRepository(db)
	shoppingListRepo := repositories.NewShoppingListRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWT.Secret, cfg.JWT.AccessExpiry, cfg.JWT.RefreshExpiry)
	userService := services.NewUserService(userRepo)
	recipeService := services.NewRecipeService(recipeRepo)
	collectionService := services.NewCollectionService(collectionRepo)
	shoppingListService := services.NewShoppingListService(shoppingListRepo)
	uploadService := services.NewUploadService(cfg)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)
	recipeHandler := handlers.NewRecipeHandler(recipeService)
	collectionHandler := handlers.NewCollectionHandler(collectionService)
	shoppingListHandler := handlers.NewShoppingListHandler(shoppingListService)
	uploadHandler := handlers.NewUploadHandler(uploadService)

	// Setup Gin router
	if cfg.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(gzip.Gzip(gzip.DefaultCompression))

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = cfg.CORS.AllowedOrigins
	corsConfig.AllowMethods = cfg.CORS.AllowedMethods
	corsConfig.AllowHeaders = cfg.CORS.AllowedHeaders
	corsConfig.AllowCredentials = true
	router.Use(cors.New(corsConfig))

	// Rate limiting
	router.Use(middleware.RateLimit(cfg.RateLimit.Requests, cfg.RateLimit.Window))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "yummio-api",
			"version": "1.0.0",
		})
	})

	// API routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
		}

		// Upload routes (authenticated)
		upload := v1.Group("/upload")
		upload.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
		{
			upload.POST("/image", uploadHandler.UploadImage)
		}

		// User routes (authenticated)
		users := v1.Group("/users")
		users.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
		{
			users.GET("/profile", userHandler.GetProfile)
			users.PUT("/profile", userHandler.UpdateProfile)
			users.DELETE("/profile", userHandler.DeleteProfile)
			users.POST("/change-password", userHandler.ChangePassword)
		}

		// Recipe routes
		recipes := v1.Group("/recipes")
		{
			// Public routes
			recipes.GET("", recipeHandler.GetRecipes)
			recipes.GET("/:id", recipeHandler.GetRecipe)
			recipes.GET("/search", recipeHandler.SearchRecipes)
			recipes.GET("/featured", recipeHandler.GetFeaturedRecipes)

			// Authenticated routes
			authenticated := recipes.Group("")
			authenticated.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
			{
				authenticated.POST("", recipeHandler.CreateRecipe)
				authenticated.PUT("/:id", recipeHandler.UpdateRecipe)
				authenticated.DELETE("/:id", recipeHandler.DeleteRecipe)
				authenticated.POST("/:id/favorite", recipeHandler.FavoriteRecipe)
				authenticated.DELETE("/:id/favorite", recipeHandler.UnfavoriteRecipe)
				authenticated.POST("/:id/rate", recipeHandler.RateRecipe)
				authenticated.GET("/my-recipes", recipeHandler.GetMyRecipes)
				authenticated.GET("/favorites", recipeHandler.GetFavorites)
			}
		}

		// Collection routes (authenticated)
		collections := v1.Group("/collections")
		collections.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
		{
			collections.GET("", collectionHandler.GetCollections)
			collections.POST("", collectionHandler.CreateCollection)
			collections.GET("/:id", collectionHandler.GetCollection)
			collections.PUT("/:id", collectionHandler.UpdateCollection)
			collections.DELETE("/:id", collectionHandler.DeleteCollection)
			collections.POST("/:id/recipes", collectionHandler.AddRecipeToCollection)
			collections.DELETE("/:id/recipes/:recipeId", collectionHandler.RemoveRecipeFromCollection)
		}

		// Shopping list routes (authenticated)
		shoppingLists := v1.Group("/shopping-lists")
		shoppingLists.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
		{
			shoppingLists.GET("", shoppingListHandler.GetShoppingLists)
			shoppingLists.POST("", shoppingListHandler.CreateShoppingList)
			shoppingLists.GET("/:id", shoppingListHandler.GetShoppingList)
			shoppingLists.PUT("/:id", shoppingListHandler.UpdateShoppingList)
			shoppingLists.DELETE("/:id", shoppingListHandler.DeleteShoppingList)
			shoppingLists.POST("/:id/items", shoppingListHandler.AddItem)
			shoppingLists.PUT("/:id/items/:itemId", shoppingListHandler.UpdateItem)
			shoppingLists.DELETE("/:id/items/:itemId", shoppingListHandler.DeleteItem)
		}
	}

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Start server
	log.Printf("Server starting on %s:%s", cfg.Server.Host, cfg.Server.Port)
	if err := router.Run(cfg.Server.Host + ":" + cfg.Server.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
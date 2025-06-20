package database

import (
	"fmt"
	"log"
	"yummio-backend/internal/config"
	"yummio-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Initialize(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		cfg.Database.Host,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.Port,
		cfg.Database.SSLMode,
		cfg.Database.TimeZone,
	)

	var logLevel logger.LogLevel
	if cfg.Server.Mode == "debug" {
		logLevel = logger.Info
	} else {
		logLevel = logger.Silent
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	log.Println("Database connection established")
	return db, nil
}

func Migrate(db *gorm.DB) error {
	log.Println("Running database migrations...")

	// Enable UUID extension
	if err := db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error; err != nil {
		return fmt.Errorf("failed to create uuid extension: %w", err)
	}

	// Auto-migrate all models
	err := db.AutoMigrate(
		&models.User{},
		&models.Recipe{},
		&models.Ingredient{},
		&models.Instruction{},
		&models.Tag{},
		&models.Rating{},
		&models.Nutrition{},
		&models.Collection{},
		&models.ShoppingList{},
		&models.ShoppingListItem{},
	)
	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Create indexes for better performance
	if err := createIndexes(db); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

func createIndexes(db *gorm.DB) error {
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_recipes_type ON recipes(type)",
		"CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty)",
		"CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes(rating)",
		"CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_recipes_title_gin ON recipes USING gin(to_tsvector('english', title))",
		"CREATE INDEX IF NOT EXISTS idx_recipes_description_gin ON recipes USING gin(to_tsvector('english', description))",
		"CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id)",
		"CREATE INDEX IF NOT EXISTS idx_instructions_recipe_id ON instructions(recipe_id)",
		"CREATE INDEX IF NOT EXISTS idx_ratings_recipe_id ON ratings(recipe_id)",
		"CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id ON shopping_list_items(shopping_list_id)",
	}

	for _, index := range indexes {
		if err := db.Exec(index).Error; err != nil {
			log.Printf("Warning: Failed to create index: %s - %v", index, err)
		}
	}

	return nil
}
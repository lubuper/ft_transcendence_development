NAME = ft_transcendence
COMP = docker-compose.yml

all: up start

up:
	@echo "Starting containers..."
	@docker-compose -p $(NAME) -f $(COMP) up --build
	@echo "Containers started [OK]\n"

down:
	@echo "Stopping containers..."
	@docker-compose -p $(NAME) down --volumes
	@echo "Containers stopped [OK]\n"

start:
	@echo "Starting containers..."
	@docker-compose -p $(NAME) start
	@echo "Containers started [OK]\n"

stop:
	@echo "Stopping containers..."
	@docker-compose -p $(NAME) stop
	@echo "Containers stopped [OK]\n"

fclean: down
	@echo "Pruning system..."
	@docker system prune -a --volumes
	@echo "System pruned [OK]\n"

re: fclean up

.PHONY: up down start stop fclean

.SILENT:

NAME = ft_transcendence
COMP = docker-compose.yml

all: up start

up:
	@echo "Generating https certificates...\n"
	@chmod +x nginx/cert_gen.sh
	@./nginx/cert_gen.sh
	@mv etc nginx
	@echo "Certificates generated [OK]\n"
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
	@echo "Removing certificates..."
	@rm -rf nginx/etc
	@rm -rf etc
	@echo "Certificates removed [OK]\n"
	@echo "Pruning system..."
	@docker system prune -a --volumes
	@echo "System pruned [OK]\n"

re: fclean up

.PHONY: up down start stop fclean

.SILENT:

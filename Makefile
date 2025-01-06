dc = docker compose

up: build
	${dc} up -d
build:
	${dc} build
restart:
	${dc} restart
down:
	${dc} down
logs:
	${dc} logs > compose.log
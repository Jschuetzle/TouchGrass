## Local Development
Build backend 
```bash
docker-compose -f docker-compose.dev.yml up --build
```

Clean backend
```
docker-compose -f docker-compose.dev.yml down -v --remove-orphans
```

ssh into docker 
```
docker exec -it touchgrass-backend-dev sh
```

docker processes
```
docker ps
```

get front end ip
```bash
ipconfig
```

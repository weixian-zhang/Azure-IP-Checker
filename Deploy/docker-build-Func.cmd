docker build -t acrisazip.azurecr.io/api/isazip .

docker build -t acrisazip.azurecr.io/jobs/azdcipfileloader .

docker run --rm -p 3000:3000 acrisazip.azurecr.io/api/isazip
 az aks create --resource-group rgGCCSHOL -n aks-pg --enable-managed-identity --vnet-subnet-id "/subscriptions/ee611083-4581-4ba1-8116-a502d4539206/resourceGroups/rgGCCSHOL/providers/Microsoft.Network/virtualNetworks/vnetInternetZone/subnets/AppTier-AKS" --attach-acr acrisazip


 az aks update -n aks-pg -g rgGCCSHOL --attach-acr acrisazip
export const useAppPaths = () => {
  const baseURL = ''
  
  const getIconPath = (iconName) => {
    return `/${iconName}`
  }
  
  const getManifestPath = () => {
    return `/manifest.json`
  }
  
  return {
    baseURL,
    getIconPath,
    getManifestPath
  }
}

export const useAppPaths = () => {
  const baseURL = ''
  
  const getIconPath = (iconName) => {
    return `${baseURL}/${iconName}`
  }
  
  const getManifestPath = () => {
    return `${baseURL}/manifest.json`
  }
  
  return {
    baseURL,
    getIconPath,
    getManifestPath
  }
}

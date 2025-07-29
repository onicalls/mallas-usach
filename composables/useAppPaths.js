export const useAppPaths = () => {
  const baseURL = process.env.NODE_ENV === 'production' ? '/mallas-usach' : ''
  
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

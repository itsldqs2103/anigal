export const imageRefreshKey = 'images:refresh';

export const notifyImagesChanged = () => {
  localStorage.setItem(imageRefreshKey, Date.now().toString());
};

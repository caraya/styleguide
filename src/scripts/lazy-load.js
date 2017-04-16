function loadImages(changes) {
  changes.forEach((change) => {
    change.target.src = change.target.dataset.src;
  })
}




if ('IntersectionObserver' in window) {
  // 1. Create the IntersectionObserver and bind it to the function we want it to work with
  let observer = new IntersectionObserver(onChange);

  function onChange(changes) {
    // 2. For each image that we want to change
    changes.forEach((change) => {
      // 3. take image url from `data-src` attribute
      change.target.src = change.target.dataset.src;
      // 4. Stop observing the current target
      observer.unobserve(change.target);
    })
  }

  // 5. Convert node list of all images with data-src attributed to array
  const imgs = [ ...document.querySelectorAll('img[data-src]') ];

  // 6. Observe each image derived from the array above
  imgs.forEach((img) => observer.observe(img));

  } else {
    console.log('Intersection Observers not supported');
    loadImages(changes);
  }

document.addEventListener('DOMContentLoaded', () => {
  const modListContainer = document.getElementById('mod-list');
  const modDetailsContainer = document.getElementById('mod-details');

  fetch('/mods')
    .then(res => res.json())
    .then(mods => {
      // If we're on mods.html
      if (modListContainer) {
        mods.forEach(mod => {
          const card = document.createElement('div');
          card.className = 'mod-card';
          card.innerHTML = `
            <img src="${mod.thumbnail}" alt="${mod.name}">
            <h3>${mod.name}</h3>
            <p>${mod.description}</p>
            <a href="${mod.download}" download>Download</a>
            <a href="mod-details.html?id=${mod.id}">Details</a>
          `;
          modListContainer.appendChild(card);
        });
      }

      // If we're on mod-details.html
      if (modDetailsContainer) {
        const params = new URLSearchParams(window.location.search);
        const modId = params.get('id');
        const mod = mods.find(m => m.id === modId);

        if (mod) {
          modDetailsContainer.innerHTML = `
            <h2>${mod.name}</h2>
            <img src="${mod.thumbnail}" alt="${mod.name}">
            <p>${mod.description}</p>
            <a href="${mod.download}" download>Download</a>
          `;
        } else {
          modDetailsContainer.innerHTML = `<p>Mod not found.</p>`;
        }
      }
    })
    .catch(err => {
      const errorMessage = `<p>Error loading mods. Please try again later.</p>`;
      if (modListContainer) modListContainer.innerHTML = errorMessage;
      if (modDetailsContainer) modDetailsContainer.innerHTML = errorMessage;
    });
});

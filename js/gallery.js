// Team4x4 gallery page script
const galleryGrid = document.getElementById('galleryGrid');
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const galleryContainer = document.getElementById('uploadedGallery');
const galleryMessage = document.getElementById('uploadedGalleryMessage');

function filterGallery(filter) {
    if (!galleryGrid) return;
    const cards = Array.from(galleryGrid.querySelectorAll('.gallery-card'));
    cards.forEach((card) => {
        const category = card.dataset.category || '';
        const show = filter === 'all' || category === filter;
        card.style.display = show ? '' : 'none';
    });
}

if (filterButtons.length && galleryGrid) {
    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            filterButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            filterGallery(button.dataset.filter || 'all');
        });
    });
}

if (galleryContainer && galleryMessage) {
    fetch('backend/get-gallery.php')
        .then((response) => response.json())
        .then((images) => {
            if (!Array.isArray(images) || images.length === 0) {
                galleryMessage.textContent = 'No uploaded gallery photos available yet.';
                return;
            }

            galleryMessage.textContent = '';
            images.forEach((image) => {
                const card = document.createElement('article');
                card.className = 'uploaded-photo-card';

                const img = document.createElement('img');
                img.className = 'uploaded-photo-thumb';
                img.src = image;
                img.alt = 'Uploaded gallery photo';

                const label = document.createElement('span');
                label.className = 'project-tag';
                label.textContent = 'Admin Upload';

                card.appendChild(img);
                card.appendChild(label);
                galleryContainer.appendChild(card);
            });
        })
        .catch(() => {
            galleryMessage.textContent = 'Unable to load uploaded gallery photos at this time.';
        });
}

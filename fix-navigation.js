// Fix navigation for student dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log("Setting up navigation fix");
    
    // Add click handlers to all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        console.log("Setting up menu item:", item.getAttribute('data-section'));
        
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            console.log("Menu item clicked:", section);
            
            // Remove active class from all menu items
            document.querySelectorAll('.menu-item').forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all content sections
            document.querySelectorAll('.content-section').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show the appropriate content section
            let contentId = section;
            if (section === 'dashboard') contentId = 'dashboard-content';
            if (section === 'profile') contentId = 'profile-content';
            if (section === 'internships') contentId = 'internship-offers-content';
            if (section === 'applications') contentId = 'my-applications-content';
            if (section === 'career-counseling') contentId = 'career-counselling-content';
            if (section === 'coming-soon') contentId = 'coming-soon-content';
            
            const targetContent = document.getElementById(contentId);
            if (targetContent) {
                console.log("Showing content section:", contentId);
                targetContent.style.display = 'block';
                
                // Display the title for coming soon sections
                if (section === 'coming-soon') {
                    const title = this.getAttribute('data-title') || 'Coming Soon';
                    const titleElem = document.getElementById('coming-soon-title');
                    if (titleElem) {
                        titleElem.textContent = title;
                    }
                }
                
                // Load internship offers if internships section is clicked
                if (section === 'internships' && typeof window.loadInternshipOffers === 'function') {
                    console.log("Calling loadInternshipOffers function");
                    setTimeout(() => {
                        window.loadInternshipOffers();
                    }, 100);
                }
                
                // Load applications if applications section is clicked
                if (section === 'applications' && typeof window.loadStudentApplications === 'function') {
                    console.log("Calling loadStudentApplications function");
                    setTimeout(() => {
                        window.loadStudentApplications();
                    }, 100);
                }
            } else {
                console.error("Content section not found:", contentId);
            }
        });
    });
    
    // Handle initial page load - check if we need to show internships
    setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const section = params.get('section');
        
        if (section === 'internships') {
            const internshipsMenuItem = document.querySelector('.menu-item[data-section="internships"]');
            if (internshipsMenuItem) {
                internshipsMenuItem.click();
            }
        }
    }, 300);
});

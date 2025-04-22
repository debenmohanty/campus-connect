// Override the renderSkillsBadges function to use div-based progress bars
function renderSkillsBadges(currentUser) {
    console.log("Rendering skills badges and chart");
    
    const skillsBadgesContainer = document.getElementById('skills-badges');
    const skillsChartContainer = document.getElementById('skills-chart');
    
    if (!skillsBadgesContainer || !skillsChartContainer) return;
    
    // Clear existing content
    skillsBadgesContainer.innerHTML = '';
    skillsChartContainer.innerHTML = '';
    
    // Check if skills are available
    if (!currentUser.skills || currentUser.skills.length === 0) {
        skillsBadgesContainer.innerHTML = '<p>No skills added yet.</p>';
        skillsChartContainer.innerHTML = '<p>No skills data available.</p>';
        return;
    }
    
    // Render skills badges
    currentUser.skills.forEach(skill => {
        const badge = document.createElement('span');
        badge.className = 'skill-badge';
        badge.textContent = skill;
        skillsBadgesContainer.appendChild(badge);
    });
    
    // Render skills chart using div-based progress bars
    const skillsData = currentUser.skills.map(skill => ({ 
        name: skill, 
        value: Math.floor(Math.random() * 100) 
    }));
    
    // Create progress bars for each skill
    skillsData.forEach(skill => {
        const skillContainer = document.createElement('div');
        skillContainer.style.marginBottom = '15px';
        
        const skillLabel = document.createElement('div');
        skillLabel.style.display = 'flex';
        skillLabel.style.justifyContent = 'space-between';
        skillLabel.style.marginBottom = '5px';
        
        const skillName = document.createElement('span');
        skillName.textContent = skill.name;
        skillName.style.fontWeight = '500';
        
        const skillValue = document.createElement('span');
        skillValue.textContent = skill.value + '%';
        skillValue.style.color = 'var(--text-light)';
        
        skillLabel.appendChild(skillName);
        skillLabel.appendChild(skillValue);
        
        const progressBarContainer = document.createElement('div');
        progressBarContainer.style.height = '8px';
        progressBarContainer.style.backgroundColor = '#e2e8f0';
        progressBarContainer.style.borderRadius = '4px';
        
        const progressBar = document.createElement('div');
        progressBar.style.height = '100%';
        progressBar.style.width = skill.value + '%';
        progressBar.style.backgroundColor = 'var(--primary-color)';
        progressBar.style.borderRadius = '4px';
        
        progressBarContainer.appendChild(progressBar);
        
        skillContainer.appendChild(skillLabel);
        skillContainer.appendChild(progressBarContainer);
        
        skillsChartContainer.appendChild(skillContainer);
    });
}



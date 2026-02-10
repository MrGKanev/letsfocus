/* ============================================
   PROFILE PICKER - UI Component (Tailwind)
   ============================================ */

import { getAllProfiles, getDefaultProfile } from '../audio/soundProfiles.js';

let currentProfile = getDefaultProfile();
let onProfileChangeCallback = null;

/**
 * Initialize the profile picker UI
 */
export function initProfilePicker(container, onProfileChange) {
    onProfileChangeCallback = onProfileChange;

    const profiles = getAllProfiles();

    profiles.forEach(profile => {
        const card = createProfileCard(profile);
        container.appendChild(card);
    });
}

/**
 * Create a profile card element with Tailwind classes
 */
function createProfileCard(profile) {
    const card = document.createElement('div');
    card.className = `
        flex-none w-24 md:w-28 p-3 md:p-4
        bg-white/5 backdrop-blur-xl
        border border-white/10
        rounded-lg
        cursor-pointer
        transition-all duration-300
        text-center
        select-none
        hover:bg-white/10 hover:border-white/20 hover:-translate-y-1
        ${profile.id === currentProfile.id ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] shadow-[0_0_20px_rgba(0,217,255,0.2)]' : ''}
    `.trim().replace(/\s+/g, ' ');

    const icon = document.createElement('div');
    icon.className = 'text-3xl md:text-4xl mb-2';
    icon.textContent = profile.icon;

    const name = document.createElement('div');
    name.className = 'text-xs md:text-sm font-semibold text-white mb-1 overflow-hidden text-ellipsis whitespace-nowrap px-1';
    name.textContent = profile.name;
    name.title = profile.name; // Show full name on hover

    card.appendChild(icon);
    card.appendChild(name);

    // Accessibility attributes
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${profile.name} - ${profile.description || 'Sound profile'}`);
    card.setAttribute('aria-pressed', profile.id === currentProfile.id ? 'true' : 'false');

    // Click handler
    card.addEventListener('click', () => {
        setActiveProfile(profile, card);
    });

    // Keyboard handler (Enter or Space)
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActiveProfile(profile, card);
        }
    });

    return card;
}

/**
 * Set the active profile
 */
function setActiveProfile(profile, clickedCard) {
    // Remove active class from all cards and update aria-pressed
    document.querySelectorAll('[id^="profileGrid"] > div').forEach(card => {
        card.className = card.className
            .replace(/bg-\[var\(--color-primary\)\]\/20/g, '')
            .replace(/border-\[var\(--color-primary\)\]/g, 'border-white/10')
            .replace(/shadow-\[0_0_20px_rgba\(0,217,255,0\.2\)\]/g, '');
        card.setAttribute('aria-pressed', 'false');
    });

    // Add active class to selected card
    clickedCard.className = `
        flex-none w-24 md:w-28 p-3 md:p-4
        bg-[var(--color-primary)]/20 backdrop-blur-xl
        border border-[var(--color-primary)]
        rounded-lg
        cursor-pointer
        transition-all duration-300
        text-center
        select-none
        shadow-[0_0_20px_rgba(0,217,255,0.2)]
        hover:bg-[var(--color-primary)]/30 hover:border-[var(--color-primary)] hover:-translate-y-1
    `.trim().replace(/\s+/g, ' ');

    // Update aria-pressed for selected card
    clickedCard.setAttribute('aria-pressed', 'true');

    currentProfile = profile;

    // Notify callback
    if (onProfileChangeCallback) {
        onProfileChangeCallback(profile);
    }
}

/**
 * Get the current profile
 */
export function getCurrentProfile() {
    return currentProfile;
}

/**
 * Select profile by index (for keyboard shortcuts)
 */
export function selectProfileByIndex(index) {
    const profiles = getAllProfiles();
    if (index >= 0 && index < profiles.length) {
        const profile = profiles[index];
        const cards = document.querySelectorAll('#profileGrid > div');
        if (cards[index]) {
            setActiveProfile(profile, cards[index]);
        }
    }
}

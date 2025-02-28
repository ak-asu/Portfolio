When generating code (follow these points and their priority is in the give order):
- Use best practices and industry standards
- Give efficient, optimized and highly performant code whenever possible
- Write modular and reusable code
- Use design patterns when appropriate
- Consider using appropriate highly rated and popular npm or python or pub.dev packages when applicable
- Follow the project's existing coding style and theme and project-specific naming conventions for files and folders
- Implement proper security measures
- Implement error handling and input validation when applicable

Following is my code requirement:
Create a single-page portfolio website for a software developer and tech enthusiast using Next.js with TypeScript. The site will be hosted on a free GitHub personal account and must utilize Redux for state management, Tailwind CSS for styling, Framer Motion for animations, and Three.js/WebGL for interactive 3D elements.
The website should feature two main modes that present the same information in different mediums:
1. Modes and Navigation:
   - Mode Toggle:  
     - Provide a toggle for switching between a “Technical” mode (terminal-style interface) and a “Non-Technical” mode (interactive/playful experience).
   - Smooth Scrolling & Snap Scrolling:  
     - Implement smooth scrolling with snap scrolling between sections, enhanced with parallax effects.
   - Navbar:  
     - Create a dynamic navbar with custom icons (e.g., a telephone icon for contact) that animate (e.g., color change) on hover and fade in/out when appearing or disappearing.  
     - On smaller screens, collapse the navbar into a hamburger menu.
     - Ensure custom icons are appropriately spaced and responsive.
2. Technical Mode (Terminal Interface):
   - Build a terminal-style interface that accepts user input and outputs text with:
     - Cursor animations.
     - Typing effects.
     - A themed design suitable for showcasing technical skills.
   - The terminal should output exactly what is entered by the user.
3. Non-Technical Mode (Interactive/Playful Interface):
   - Interactive 3D Elements:  
     - Include a 3D model of a mini-laptop that reacts to mouse interactions (e.g., opening and closing) with physics-based interactions (e.g., smooth transitions and realistic movements).
   - Mini-Laptop Project Showcase:  
     - When a project is clicked, update the mini-screen (embedded in the 3D mini-laptop) to show project details such as tech stack, description, duration, etc.  
     - The mini-screen should have buttons (e.g., “Tech Stack”, “Description”, “Duration”) that, when clicked, update the content via a slide up/down or fade transition.  
     - Show visual feedback (a custom progress bar or loading spinner) on the mini-screen when switching content.
     - Embed project videos hosted on YouTube.
   - 2D Sprite Character:  
     - Add a 2D sprite character whose eyes follow the mouse cursor.  
     - The character should change expressions based on interactions (e.g., smile with enthusiasm when the projects section is explored), but it should only change expressions—not perform other actions.  
     - Expressions should change to reflect enthusiasm, curiosity, or neutrality, based on the user’s interaction with the site.
   - Mini-Games Section:  
     - Implement a separate section featuring a single-player tic-tac-toe game that includes:
       - Restart and retry buttons.
       - A score display that tracks wins/losses across rounds.
   - Custom Cursor:  
     - Implement a custom cursor that remains consistent across the site (hiding during certain interactions) and does not change shape on hover.
4. UI/UX and Animations:
   - Project Cards & Grid Layout:  
     - Use a grid-based layout for displaying projects.  
     - Project cards should change color on hover.
   - Section Descriptions (Scrolling Animations):  
     - When scrolling up, text descriptions in each section should animate with a typing effect; when scrolling down, the text remains static.  
     - Implement logic for triggering typing animations when scrolling up, and ensure the animation resets appropriately when the user leaves the section or scrolls back up.
   - Button Hover Effects:  
     - Implement hover effects for buttons (scaling, color change, subtle animations).
   - Loading Animations:  
     - Use a custom progress bar or spinner with medium complexity (additional visual elements) for site loading and content switching.
     - Ensure progress bar has a fade-in/out effect for smooth transitions when switching between sections.
   - Background Audio:  
     - Integrate looped background audio (with a software development, AI, and machines theme) that fades in and out during loading and when switching sections or modes.
5. State Management & Animation Settings:
   - Use Redux to manage:
     - The current mode (Technical vs. Non-Technical).
     - User interactions and dynamic content updates (e.g., which project detail is displayed on the mini-laptop screen).
     - Animation settings with options for basic, medium, and expert levels (ensure there's an intuitive UI to control animation complexity, such as a settings dropdown or toggle).
6. Development & Performance:
   - The entire application must be written in TypeScript.
   - Use lazy loading for images, videos, and other heavy elements to improve performance.
   - Ensure responsiveness across all devices using Tailwind CSS breakpoints.
   - Implement best practices for SEO and performance optimization within a Next.js framework.
7. Customizations and Interactive Features:
   - Ensure the mini-laptop and 3D elements have realistic physics-based transitions when interacting with the mouse. Consider using Three.js physics libraries to create smooth, natural movements.
   - Add clear visual feedback for user interactions with project details (such as buttons updating content on the mini-laptop) and animations (e.g., slide-up transitions for showing the tech stack).
   - Keep user input and experience consistent across both modes, but adjust the experience based on the selected mode, without losing any important information.
1. Physics-Based Interactions: 
   - I didn't explicitly mention physics-based interactions (as discussed earlier) for elements such as the 3D models or mini-laptop interactions. While the prompt covers 3D interactivity, physics-based elements should be added to ensure proper behavior.
2. Mini-Screen Dynamic Transitions: 
   - While the prompt mentions switching content on the mini-laptop screen, the dynamic transitions when switching between different project details (tech stack, description, etc.) could be emphasized a bit more with specific transitions like slide up/down or fade transitions.
3. Mode Control for Animation Complexity: 
   - The prompt touches on animation settings for basic, medium, and expert modes, but it doesn't go into detail about the user interface for adjusting the animation complexity. You may want to clarify how the user interacts with these settings, such as through a settings button or dropdown.
4. Custom Icons for Sections (e.g., Telephone for Contact): 
   - Custom icons for the navbar and hover animations were mentioned but could have been reiterated in terms of positioning, spacing, and how they should behave when interacting with the navbar, including animations.
5. Text Animations on Scrolling Up/Down: 
   - While scrolling animations (typing effect when scrolling up) are mentioned, there’s no specific mention of how the scroll should trigger these effects. The prompt could clarify the scrolling behavior further (e.g., should the user scroll up to trigger typing animations, and should it reset when they scroll down or when they leave the section?).
6. Character Expression Transitions: 
   - The 2D character's expressions were covered well, but the exact logic for when expressions change could be more specific in the prompt (e.g., expressions like enthusiasm for project exploration, neutral or other variations during browsing).
7. Progress Bar or Spinner for Content Switching: 
   - The prompt mentions visual feedback but could clarify the specifics of the progress bar or spinner behavior, such as its style, animation speed, or additional UI elements to indicate project loading.
Provide all necessary code (HTML/JSX, CSS/Tailwind, JavaScript/TypeScript) and organize the project into modular components with clear comments. The design should be modern, dynamic, and interactive, showcasing the developer’s skills in both technical and playful presentations.
document.addEventListener('DOMContentLoaded', () => {
    // Supabase Initialization
    const SUPABASE_URL = 'https://eyjybwkoucwoabzpatvm.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5anlid2tvdWN3b2FienBhdHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NDYyODYsImV4cCI6MjA5MDUyMjI4Nn0.byVDA_bMry8xqO9htPIyLLZxZGcorvy5MooFyV5RcIU';
    
    let supabaseClient = null;
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("Supabase library not loaded.");
    }

    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const closeFeedback = document.getElementById('closeFeedback');
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const feedbackSuccess = document.getElementById('feedbackSuccess');
    const submitBtn = document.getElementById('submitFeedback');

    if (!feedbackBtn || !feedbackModal) return;

    // Open modal
    feedbackBtn.addEventListener('click', () => {
        feedbackModal.setAttribute('aria-hidden', 'false');
        feedbackMessage.focus();
    });

    // Close modal
    closeFeedback.addEventListener('click', () => {
        closeFeedbackModal();
    });

    // Close on overlay click
    feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            closeFeedbackModal();
        }
    });

    function closeFeedbackModal() {
        feedbackModal.setAttribute('aria-hidden', 'true');
        // Reset form after short delay to allow transition
        setTimeout(() => {
            feedbackForm.style.display = 'block';
            feedbackSuccess.style.display = 'none';
            feedbackForm.reset();
        }, 300);
    }

    // Submit form
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = feedbackMessage.value.trim();
        if (!message || !supabaseClient) return;

        // Show loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading-spinner" style="width:16px;height:16px;border-width:2px;margin:0;border-top-color:white;"></span> Sending...';
        submitBtn.disabled = true;

        try {
            const { data, error } = await supabaseClient
                .from('feedback')
                .insert([{ message: message }]);

            if (error) throw error;

            // Show success
            feedbackForm.style.display = 'none';
            feedbackSuccess.style.display = 'flex';
            
            // Auto close after 3 seconds
            setTimeout(() => {
                closeFeedbackModal();
            }, 3000);

        } catch (error) {
            console.error('Error saving feedback:', error);
            alert('Sorry, there was an error sending your feedback. Please try again.');
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});

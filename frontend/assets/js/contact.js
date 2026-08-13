function validateContactForm(event) {
    event.preventDefault(); // Prevent page reload

    // Form Field Values
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    // Error Elements reset
    document.getElementById('nameError').innerText = '';
    document.getElementById('emailError').innerText = '';
    document.getElementById('phoneError').innerText = '';
    document.getElementById('messageError').innerText = '';

    let isValid = true;

    // 1. Name Validation
    if (name === '') {
        document.getElementById('nameError').innerText = 'Please enter your full name.';
        isValid = false;
    }

    // 2. Email Validation (Regex)
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (email === '' || !email.match(emailPattern)) {
        document.getElementById('emailError').innerText = 'Please enter a valid email address.';
        isValid = false;
    }

    // 3. Phone Number Validation (10 digits)
    const phonePattern = /^[0-9]{10}$/;
    if (phone === '' || !phone.match(phonePattern)) {
        document.getElementById('phoneError').innerText = 'Please enter a valid 10-digit phone number.';
        isValid = false;
    }

    // 4. Message Validation
    if (message === '') {
        document.getElementById('messageError').innerText = 'Please enter your message.';
        isValid = false;
    }

    // Show Success Message if Valid
    if (isValid) {
        document.getElementById('formSuccess').style.display = 'block';
        document.getElementById('contactForm').reset();

        setTimeout(() => {
            document.getElementById('formSuccess').style.display = 'none';
        }, 4000);
    }

    return false;
}
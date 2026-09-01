
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

const togglePassword = document.getElementById("togglePassword");


/* =========================
   PASSWORD VISIBILITY
========================= */

togglePassword.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    togglePassword.innerHTML = isPassword
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';

});


/* =========================
   MESSAGE
========================= */

function showMessage(message, type = "error") {

    loginMessage.textContent = message;

    loginMessage.className =
        `login-message ${type}`;
}


/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        showMessage(
            "Enter your email and password."
        );

        return;
    }


    loginButton.disabled = true;
    loginButton.classList.add("loading");

    showMessage("Signing in...", "success");


    try {

        console.log("================================");
        console.log("PHISHGUARD LOGIN");
        console.log("================================");

        console.log("Supabase URL:", SUPABASE_URL);
        console.log("Email:", email);


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        console.log("Supabase response:", data);
        console.log("Supabase error:", error);


        if (error) {

            console.error(
                "SUPABASE LOGIN ERROR:",
                error
            );

            showMessage(
                error.message || "Login failed."
            );

            loginButton.disabled = false;
            loginButton.classList.remove("loading");

            return;
        }


        if (!data.session) {

            showMessage(
                "Login succeeded but no session was created."
            );

            loginButton.disabled = false;
            loginButton.classList.remove("loading");

            return;
        }


        console.log(
            "LOGIN SUCCESS:",
            data.user
        );


        showMessage(
            "Authentication successful. Redirecting...",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "admin-dashboard.html";

        }, 500);


    } catch (error) {

        console.error(
            "UNEXPECTED LOGIN ERROR:",
            error
        );

        showMessage(
            error.message || "Unexpected login error."
        );

        loginButton.disabled = false;
        loginButton.classList.remove("loading");
    }

});

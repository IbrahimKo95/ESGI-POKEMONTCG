const toast = document.getElementById("toast");
const persistentToast = document.getElementById("persistentToast");

export function showToast(message, type = "info") {
    toast.textContent = message;
    toast.classList.remove("opacity-0");
    if (type === "error") {
        toast.classList.add("bg-red-500");
        toast.classList.remove("bg-green-500", "bg-accent");
    } else if (type === "success") {
        toast.classList.add("bg-green-500");
        toast.classList.remove("bg-red-500", "bg-accent");
    }
    else {
        toast.classList.add("bg-accent");
        toast.classList.remove("bg-red-500", "bg-green-500");
    }
    setTimeout(() => toast.classList.add("opacity-0"), 4000);
}

export function showPersistentToast(message) {
    persistentToast.textContent = message;
    persistentToast.style.display = "block";
}

export function hidePersistentToast() {
    persistentToast.style.display = "none";
}
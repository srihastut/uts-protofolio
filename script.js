let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar'); // Fixed navbar selector to match the correct class name

let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt event fired");
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installButton").style.display = "block";
});

const installButton = document.getElementById("installButton");

installButton.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    deferredPrompt = null;
    installButton.style.display = "none"; // Sembunyikan tombol setelah prompt ditampilkan
  }
});


window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id'); // Fixed variable name from `set` to `sec`

        if (top >= offset && top < offset + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                document.querySelector('header nav a[href="#' + id + '"]').classList.add('active');
            });
        }
    });
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
  
        // Kirim pesan untuk meminta ukuran cache
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage('get-cache-usage');
        }
  
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data.type === 'cache-usage') {
            const sizeInKB = (event.data.size / 1024).toFixed(2);
            document.getElementById('cache-usage').textContent = `Cache usage: ${sizeInKB} KB`;
          }
        });
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }

  function toggleContent() {
    const boxes = document.querySelectorAll(".box"); // Ambil semua elemen dengan class 'box'
    const button = document.getElementById("toggle-button");

    // Toggle visibilitas semua box
    boxes.forEach(box => box.classList.toggle("show"));

    // Ubah teks tombol antara 'Read More' dan 'Read Less'
    if (button.innerText === "Read More") {
        button.innerText = "Read Less";
    } else {
        button.innerText = "Read More";
    }
}

// Cek apakah browser mendukung IndexedDB
if (!window.indexedDB) {
  alert("Browser Anda tidak mendukung IndexedDB");
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker Registered'))
      .catch(err => console.log('Service Worker registration failed', err));
}

// IndexedDB setup
let db;
const request = indexedDB.open("contactDB", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  const store = db.createObjectStore("contacts", { keyPath: "id", autoIncrement: true });
  store.createIndex("fullName", "fullName", { unique: false });
};

request.onsuccess = function(event) {
  db = event.target.result;
  console.log("Database berhasil diakses");
};

request.onerror = function(event) {
  console.error("Database error: " + event.target.errorCode);
};

// Form Submission
document.getElementById("contactForm").addEventListener("submit", function(event) {
  event.preventDefault();

  // Ambil data dari form
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const message = document.getElementById("message").value;

  // Cek apakah semua data sudah diisi
  if (!fullName || !email || !message) {
      alert("Mohon isi semua field yang wajib.");
      return;
  }

  // Data kontak yang akan disimpan
  const contact = {
      fullName,
      email,
      phoneNumber,
      message,
      timestamp: new Date().toISOString()
  };

  // Simpan data ke IndexedDB
  const transaction = db.transaction(["contacts"], "readwrite");
  const store = transaction.objectStore("contacts");
  const addRequest = store.add(contact);

  addRequest.onsuccess = function() {
      alert("Pesan berhasil disimpan!");
      document.getElementById("contactForm").reset();
  };

  addRequest.onerror = function(event) {
      console.error("Gagal menyimpan pesan:", event.target.error);
      alert("Gagal menyimpan pesan.");
  };
});



menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// Meminta izin notifikasi secara otomatis saat halaman dimuat
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      // jika izin diberikan, mengirim pesan ke service worker untuk menampilkan notifikasi
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION'
        });
      } else {
        console.log('Service Worker belum terdaftar atau tidak aktif.');
      }
    } else {
      console.log('Izin notifikasi ditolak atau belum dipilih.');
    }
  }).catch(error => {
    console.error('Terjadi kesalahan saat meminta izin notifikasi:', error);
  });
} else {
  console.log('Browser tidak mendukung Notification API.');
}

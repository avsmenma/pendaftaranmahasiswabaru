// server.js
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Middleware untuk serving uploaded files
app.use("/uploads", express.static("uploads"));

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/dokumen";
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate nama file unik dengan timestamp dan random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const namaFile = `${timestamp}_${randomString}${ext}`;
    cb(null, namaFile);
  },
});

// Filter file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format file tidak diizinkan. Hanya PDF, JPG, JPEG, PNG yang diperbolehkan."
      ),
      false
    );
  }
};

// Konfigurasi multer dengan batasan ukuran 2MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// Konfigurasi Database dengan Connection Pooling
const db = mysql.createPool({
  host: "44.220.144.82",
  user: "remoteuser",
  password: "passwordku123",
  database: "pmb",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: "utf8mb4",
});

// Test koneksi database
db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MySQL database with connection pooling");
  connection.release(); // Release koneksi kembali ke pool
});

// Function untuk query dengan error handling
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: "spmb.app@gmail.com",
    pass: "fkzigswifdhtmobq",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Setup tabel password_reset_codes jika belum ada
const setupPasswordResetTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS password_reset_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL,
      expires_at DATETIME NOT NULL,
      used TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_code (code),
      INDEX idx_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating password_reset_codes table:", err);
    } else {
      console.log("Password reset codes table ready");
    }
  });
};

// Panggil setup saat server start
setupPasswordResetTable();

// Fungsi untuk generate kode verifikasi 6 digit
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Fungsi untuk mengirim email verifikasi
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: "spmb.app@gmail.com",
    to: email,
    subject: "Kode Verifikasi Reset Password - SPMB App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #365368;">Reset Password</h2>
        <p>Anda telah meminta untuk mereset password akun Anda.</p>
        <p>Berikut adalah kode verifikasi Anda:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #365368; font-size: 36px; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p>Kode ini akan berlaku selama <strong>15 menit</strong>.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Email ini dikirim secara otomatis, mohon jangan membalas.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Route untuk halaman utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route untuk halaman register
app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/regis.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Route untuk halaman dashboard
app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// API Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("=== LOGIN DEBUG ===");
  console.log("Request body:", req.body);
  console.log("Email:", email);
  console.log("Password provided:", password);

  if (!email || !password) {
    console.log("Missing email or password");
    return res.json({
      success: false,
      message: "Email dan password harus diisi",
    });
  }

  const query = "SELECT * FROM user WHERE email = ?";
  console.log("Executing query:", query, "with email:", email);

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }

    console.log("Query results:", results);
    console.log("Number of users found:", results.length);

    if (results.length === 0) {
      console.log("No user found with email:", email);
      return res.json({
        success: false,
        message: "Email tidak ditemukan",
      });
    }

    const user = results[0];
    console.log("User found:", user);
    console.log(
      "Stored password (first 10 chars):",
      user.password.substring(0, 10) + "..."
    );

    let passwordMatch = false;

    // Check if password is hashed with bcrypt
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      console.log("Password is hashed with bcrypt, comparing...");
      try {
        passwordMatch = await bcrypt.compare(password, user.password);
        console.log("Bcrypt comparison result:", passwordMatch);

        // Fallback to plain text if bcrypt fails (for backward compatibility)
        if (!passwordMatch) {
          console.log(
            "Bcrypt failed, trying plain text comparison as fallback..."
          );
          passwordMatch = password === user.password;
          console.log("Plain text fallback result:", passwordMatch);
        }
      } catch (bcryptErr) {
        console.error("Bcrypt error:", bcryptErr);
        // Fallback to plain text on error
        console.log("Bcrypt error, falling back to plain text comparison...");
        passwordMatch = password === user.password;
        console.log("Plain text fallback result:", passwordMatch);
      }
    } else {
      console.log("Password is plain text, comparing directly...");
      passwordMatch = password === user.password;
      console.log("Plain text comparison result:", passwordMatch);
    }

    if (!passwordMatch) {
      return res.json({
        success: false,
        message: "Password salah",
      });
    }

    // Login berhasil
    return res.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id_pengguna,
        username: user.email,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
      },
    });
  });
});

// API Register
app.post("/api/register", async (req, res) => {
  const { email, namaLengkap, password, confirmPassword } = req.body;

  if (!email || !password || !namaLengkap) {
    return res.json({
      success: false,
      message: "Email, nama lengkap, dan password harus diisi",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({
      success: false,
      message: "Format email tidak valid",
    });
  }

  if (password.length < 8) {
    return res.json({
      success: false,
      message: "Password minimal 8 karakter",
    });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.json({
      success: false,
      message: "Password dan konfirmasi password tidak cocok",
    });
  }

  const checkQuery = "SELECT * FROM user WHERE email = ?";

  db.query(checkQuery, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }

    if (results.length > 0) {
      return res.json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery =
        "INSERT INTO user (email, password, nama_lengkap, role) VALUES (?, ?, ?, ?)";
      const values = [email, hashedPassword, namaLengkap, "mahasiswa"];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.json({
            success: false,
            message: "Terjadi kesalahan saat mendaftar",
          });
        }

        return res.json({
          success: true,
          message: "Registrasi berhasil",
          user: {
            id: result.insertId,
            username: email,
            namaLengkap: namaLengkap,
            role: "mahasiswa",
          },
        });
      });
    } catch (hashErr) {
      console.error("Error hashing password:", hashErr);
      return res.json({
        success: false,
        message: "Terjadi kesalahan saat memproses password",
      });
    }
  });
});

// API Reset Password - Request reset password dan kirim kode verifikasi via email
app.post("/api/reset_password", async (req, res) => {
  const { email } = req.body;

  console.log("=== RESET PASSWORD REQUEST ===");
  console.log("Email:", email);

  if (!email) {
    return res.json({
      success: false,
      message: "Email harus diisi",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({
      success: false,
      message: "Format email tidak valid",
    });
  }

  // Cek apakah email terdaftar
  const checkEmailQuery = "SELECT id_pengguna, email FROM user WHERE email = ?";

  db.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }

    // Selalu kirim sukses untuk keamanan (tidak reveal apakah email terdaftar)
    if (results.length === 0) {
      // Email tidak terdaftar, tapi kita tetap return success untuk keamanan
      console.log("Email not found:", email);
      return res.json({
        success: true,
        message: "Jika email terdaftar, kode verifikasi telah dikirim",
      });
    }

    // Generate kode verifikasi 6 digit
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit dari sekarang

    // Hapus kode lama yang belum digunakan untuk email ini
    const deleteOldCodesQuery =
      "DELETE FROM password_reset_codes WHERE email = ? AND used = 0";

    db.query(deleteOldCodesQuery, [email], (err) => {
      if (err) {
        console.error("Error deleting old codes:", err);
      }

      // Simpan kode baru ke database
      const insertCodeQuery = `
        INSERT INTO password_reset_codes (email, code, expires_at, used)
        VALUES (?, ?, ?, 0)
      `;

      db.query(
        insertCodeQuery,
        [email, code, expiresAt],
        async (err, result) => {
          if (err) {
            console.error("Error saving reset code:", err);
            return res.json({
              success: false,
              message: "Gagal menyimpan kode verifikasi",
            });
          }

          // Kirim email dengan kode verifikasi
          const emailResult = await sendVerificationEmail(email, code);

          if (emailResult.success) {
            console.log("Verification code sent successfully to:", email);
            return res.json({
              success: true,
              message: "Kode verifikasi telah dikirim ke email Anda",
            });
          } else {
            console.error("Failed to send email:", emailResult.error);
            // Hapus kode dari database jika email gagal dikirim
            const deleteCodeQuery =
              "DELETE FROM password_reset_codes WHERE id = ?";
            db.query(deleteCodeQuery, [result.insertId], () => {});

            return res.json({
              success: false,
              message: "Gagal mengirim email. Silakan coba lagi nanti.",
            });
          }
        }
      );
    });
  });
});

// API Verify Reset Code - Verifikasi kode reset password
app.post("/api/verify-reset-code", async (req, res) => {
  const { email, code } = req.body;

  console.log("=== VERIFY RESET CODE ===");
  console.log("Email:", email);
  console.log("Code:", code);

  if (!email || !code) {
    return res.json({
      success: false,
      message: "Email dan kode verifikasi harus diisi",
    });
  }

  if (code.length !== 6) {
    return res.json({
      success: false,
      message: "Kode verifikasi harus 6 digit",
    });
  }

  // Cari kode verifikasi yang valid
  const verifyQuery = `
    SELECT id, email, code, expires_at, used
    FROM password_reset_codes
    WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;

  db.query(verifyQuery, [email, code], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }

    if (results.length === 0) {
      return res.json({
        success: false,
        message: "Kode verifikasi tidak valid atau sudah expired",
      });
    }

    // Generate token untuk reset password (simpan ID reset code)
    const resetCodeId = results[0].id;
    const token = Buffer.from(`${email}:${resetCodeId}:${Date.now()}`).toString(
      "base64"
    );

    // Tandai kode sebagai used (tapi jangan delete dulu, untuk tracking)
    // Kita akan hapus setelah password berhasil direset

    return res.json({
      success: true,
      message: "Kode verifikasi valid",
      token: token,
    });
  });
});

// API Reset Password Confirm - Reset password setelah verifikasi berhasil
app.post("/api/reset-password-confirm", async (req, res) => {
  const { email, token, newPassword } = req.body;

  console.log("=== RESET PASSWORD CONFIRM ===");
  console.log("Email:", email);

  if (!email || !token || !newPassword) {
    return res.json({
      success: false,
      message: "Email, token, dan password baru harus diisi",
    });
  }

  // Validasi password
  if (newPassword.length < 8) {
    return res.json({
      success: false,
      message: "Password minimal 8 karakter",
    });
  }

  // Decode token untuk mendapatkan reset code ID
  let resetCodeId;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    resetCodeId = parts[1];
  } catch (error) {
    return res.json({
      success: false,
      message: "Token tidak valid",
    });
  }

  // Verifikasi token dengan cek reset code
  const verifyTokenQuery = `
    SELECT id, email, used
    FROM password_reset_codes
    WHERE id = ? AND email = ? AND used = 0 AND expires_at > NOW()
  `;

  db.query(verifyTokenQuery, [resetCodeId, email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }

    if (results.length === 0) {
      return res.json({
        success: false,
        message: "Token tidak valid atau sudah expired",
      });
    }

    // Hash password baru
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password di database
      const updatePasswordQuery =
        "UPDATE user SET password = ? WHERE email = ?";

      db.query(updatePasswordQuery, [hashedPassword, email], (err, result) => {
        if (err) {
          console.error("Error updating password:", err);
          return res.json({
            success: false,
            message: "Gagal mengubah password",
          });
        }

        if (result.affectedRows === 0) {
          return res.json({
            success: false,
            message: "Email tidak ditemukan",
          });
        }

        // Tandai reset code sebagai used dan hapus semua reset code untuk email ini
        const deleteCodesQuery =
          "DELETE FROM password_reset_codes WHERE email = ?";
        db.query(deleteCodesQuery, [email], (err) => {
          if (err) {
            console.error("Error deleting reset codes:", err);
          }
        });

        console.log("Password reset successfully for:", email);
        return res.json({
          success: true,
          message: "Password berhasil diubah",
        });
      });
    } catch (hashError) {
      console.error("Error hashing password:", hashError);
      return res.json({
        success: false,
        message: "Gagal memproses password",
      });
    }
  });
});

// API Save Form Data - Data Pribadi (FIXED VERSION)
app.post("/api/save-pribadi", (req, res) => {
  const { userId, ...formData } = req.body;

  console.log("=== SAVE PRIBADI DEBUG ===");
  console.log("Request body:", req.body);
  console.log("UserId:", userId);

  if (!userId) {
    console.log("Error: User ID tidak ditemukan");
    return res.json({ success: false, message: "User ID tidak ditemukan" });
  }

  // Normalize jenis_kelamin to match enum values
  let jenisKelamin = null;
  if (formData.jenisKelamin) {
    if (formData.jenisKelamin.toLowerCase() === "laki-laki") {
      jenisKelamin = "Laki-Laki";
    } else if (formData.jenisKelamin.toLowerCase() === "perempuan") {
      jenisKelamin = "Perempuan";
    }
  }

  // Handle location data - convert to NULL since FK tables don't exist but columns exist
  const provinsiId = formData.provinsi ? parseInt(formData.provinsi) : null;
  const kabupatenId = formData.kabupatenKota
    ? parseInt(formData.kabupatenKota)
    : null;
  const kecamatanId = formData.kecamatan ? parseInt(formData.kecamatan) : null;
  const kelurahanId = formData.kelurahan ? parseInt(formData.kelurahan) : null;

  // Set all location IDs to NULL since foreign key tables don't exist
  const finalProvinsi = null;
  const finalKabupaten = null;
  const finalKecamatan = null;
  const finalKelurahan = null;

  // Check if data exists first, then decide to INSERT or UPDATE
  const checkQuery = "SELECT id_mahasiswa FROM mahasiswa WHERE id_pengguna = ?";

  db.query(checkQuery, [userId], (err, checkResults) => {
    if (err) {
      console.error("Error checking existing data:", err);
      return res.json({
        success: false,
        message: "Error checking existing data",
      });
    }

    let query;
    const values = [
      formData.namaLengkap || null,
      formData.nik || null,
      formData.tempatLahir || null,
      formData.tanggalLahir || null,
      jenisKelamin,
      formData.agama || null,
      formData.noHP || null,
      formData.email || null,
      formData.alamat || null,
      finalProvinsi,
      finalKabupaten,
      finalKecamatan,
      finalKelurahan,
      formData.kodePos || null,
    ];

    if (checkResults.length > 0) {
      // UPDATE existing data - use correct column names
      query = `UPDATE mahasiswa SET nama_lengkap=?, nik=?, tempat_lahir=?, tanggal_lahir=?,
                 jenis_kelamin=?, agama=?, no_hp=?, email=?, alamat_mahasiswa=?, id_provinsi=?,
                 id_kabupaten=?, id_kecamatan=?, id_kelurahan=?, kode_pos=?
                 WHERE id_pengguna=?`;
      values.push(userId);
      console.log("Using UPDATE query for existing user");
    } else {
      // INSERT new data - use correct column names
      // tanggal_daftar is NULL initially, will be set when user actually submits
      query = `INSERT INTO mahasiswa (id_pengguna, nama_lengkap, nik, tempat_lahir, tanggal_lahir,
                 jenis_kelamin, agama, no_hp, email, alamat_mahasiswa, id_provinsi, id_kabupaten,
                 id_kecamatan, id_kelurahan, kode_pos, tanggal_daftar)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`;
      values.unshift(userId); // Add userId at the beginning
      console.log("Using INSERT query for new user");
    }

    console.log("SQL Query:", query);
    console.log("Values:", values);

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        console.error("Error details:", {
          code: err.code,
          errno: err.errno,
          sqlMessage: err.sqlMessage,
          sqlState: err.sqlState,
        });
        return res.json({
          success: false,
          message: "Gagal menyimpan data: " + err.sqlMessage,
        });
      }

      console.log("Query result:", result);
      const operation = checkResults.length > 0 ? "diperbarui" : "ditambahkan";
      res.json({
        success: true,
        message: `Data pribadi berhasil ${operation}`,
        operation: checkResults.length > 0 ? "update" : "insert",
        affectedRows: result.affectedRows || result.insertId || null,
      });
    });
  });
});

// API Save Form Data - Data Akademik
app.post("/api/save-akademik", (req, res) => {
  const { userId, ...formData } = req.body;

  console.log("=== SAVE AKADEMIK DEBUG ===");
  console.log("Request body:", req.body);
  console.log("UserId:", userId);
  console.log("Form data:", formData);
  console.log("Form data types:", {
    asal_sekolah: typeof formData.asal_sekolah,
    nilai_rata_rata: typeof formData.nilai_rata_rata,
    tahun_lulus: typeof formData.tahun_lulus,
    id_jurusan: typeof formData.id_jurusan,
    id_prodi: typeof formData.id_prodi,
  });

  if (!userId) {
    console.log("Error: User ID tidak ditemukan");
    return res.json({ success: false, message: "User ID tidak ditemukan" });
  }

  // Get mahasiswa ID first
  const getMahasiswaQuery =
    "SELECT id_mahasiswa FROM mahasiswa WHERE id_pengguna = ?";

  db.query(getMahasiswaQuery, [userId], (err, mahasiswaResult) => {
    if (err) {
      console.error("Database error getting mahasiswa ID:", err);
      return res.json({
        success: false,
        message: "Gagal mendapatkan data mahasiswa",
      });
    }

    if (mahasiswaResult.length === 0) {
      console.log("Error: Mahasiswa tidak ditemukan");
      return res.json({
        success: false,
        message: "Data mahasiswa tidak ditemukan",
      });
    }

    const idMahasiswa = mahasiswaResult[0].id_mahasiswa;
    console.log("Mahasiswa ID:", idMahasiswa);

    // Check if academic data already exists
    const checkQuery =
      "SELECT id_akademik FROM data_akademik WHERE id_mahasiswa = ?";

    db.query(checkQuery, [idMahasiswa], (err, checkResult) => {
      if (err) {
        console.error("Database error checking existing data:", err);
        return res.json({
          success: false,
          message: "Gagal mengecek data existing",
        });
      }

      let query, values;

      // Validate required fields
      if (!formData.id_jurusan) {
        console.log("Error: id_jurusan is required but not provided");
        return res.json({
          success: false,
          message: "Jurusan harus dipilih",
        });
      }

      if (checkResult.length > 0) {
        // UPDATE existing data
        query = `UPDATE data_akademik SET 
                 asal_sekolah=?, nilai_rata_rata=?, tahun_lulus=?, id_jurusan=?, id_prodi=?
                 WHERE id_mahasiswa=?`;
        values = [
          formData.asal_sekolah,
          formData.nilai_rata_rata,
          formData.tahun_lulus,
          formData.id_jurusan,
          formData.id_prodi,
          idMahasiswa,
        ];
        console.log("Updating existing academic data");
      } else {
        // INSERT new data - correct order: id_mahasiswa, id_jurusan, id_prodi, asal_sekolah, tahun_lulus, nilai_rata_rata
        query = `INSERT INTO data_akademik 
                 (id_mahasiswa, id_jurusan, id_prodi, asal_sekolah, tahun_lulus, nilai_rata_rata)
                 VALUES (?, ?, ?, ?, ?, ?)`;
        values = [
          idMahasiswa,
          formData.id_jurusan,
          formData.id_prodi,
          formData.asal_sekolah,
          formData.tahun_lulus,
          formData.nilai_rata_rata,
        ];
        console.log("Inserting new academic data");
      }

      console.log("Query:", query);
      console.log("Values:", values);

      db.query(query, values, (err, result) => {
        if (err) {
          console.error("Database error saving academic data:", err);
          console.error("Error details:", {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState,
            sql: err.sql,
          });
          return res.json({
            success: false,
            message: "Gagal menyimpan data akademik: " + err.sqlMessage,
            error: {
              code: err.code,
              message: err.message,
              sqlMessage: err.sqlMessage,
            },
          });
        }

        console.log("Academic data saved successfully");
        console.log("Query result:", result);
        const operation = checkResult.length > 0 ? "diperbarui" : "ditambahkan";
        res.json({
          success: true,
          message: `Data akademik berhasil ${operation}`,
          operation: checkResult.length > 0 ? "update" : "insert",
          result: result,
        });
      });
    });
  });
});

// API Upload Dokumen - Upload 4 file sekaligus
app.post(
  "/api/upload",
  upload.fields([
    { name: "ijazah", maxCount: 1 },
    { name: "kartuKeluarga", maxCount: 1 },
    { name: "aktaKelahiran", maxCount: 1 },
    { name: "pasFoto", maxCount: 1 },
  ]),
  (req, res) => {
    const { userId } = req.body;

    console.log("=== UPLOAD DOKUMEN DEBUG ===");
    console.log("Request body:", req.body);
    console.log("User ID:", userId);
    console.log("Uploaded files:", req.files);

    if (!userId) {
      console.log("Error: User ID tidak ditemukan");
      return res.json({ success: false, message: "User ID tidak ditemukan" });
    }

    // Get uploaded files (allow partial upload - not all files required at once)
    const uploadedFiles = req.files;

    // Check if at least one file is uploaded
    if (!uploadedFiles || Object.keys(uploadedFiles).length === 0) {
      console.log("Error: No files uploaded");
      return res.json({
        success: false,
        message: "Tidak ada file yang diupload",
      });
    }

    console.log("Files being uploaded:", Object.keys(uploadedFiles));

    // Get mahasiswa ID terlebih dahulu
    const getMahasiswaQuery =
      "SELECT id_mahasiswa FROM mahasiswa WHERE id_pengguna = ?";

    db.query(getMahasiswaQuery, [userId], (err, mahasiswaResult) => {
      if (err) {
        console.error("Database error getting mahasiswa ID:", err);
        return res.json({
          success: false,
          message: "Gagal mendapatkan data mahasiswa",
        });
      }

      if (mahasiswaResult.length === 0) {
        console.log("Error: Mahasiswa tidak ditemukan");
        return res.json({
          success: false,
          message:
            "Data mahasiswa tidak ditemukan. Silakan lengkapi data pribadi terlebih dahulu.",
        });
      }

      const idMahasiswa = mahasiswaResult[0].id_mahasiswa;
      console.log("Mahasiswa ID:", idMahasiswa);

      // Mapping file types
      const fileTypes = {
        ijazah: "Ijazah/SKL",
        kartuKeluarga: "Kartu Keluarga",
        aktaKelahiran: "Akta Kelahiran",
        pasFoto: "Pas Foto 3x4",
      };

      let uploadedCount = 0;
      const fileNamesToProcess = Object.keys(uploadedFiles); // Only process files that were uploaded
      const totalFiles = fileNamesToProcess.length;
      const uploadedDocuments = [];

      console.log(`Processing ${totalFiles} file(s):`, fileNamesToProcess);

      // Proses setiap file yang di-upload
      fileNamesToProcess.forEach((fileName) => {
        const file = uploadedFiles[fileName][0];
        const jenisDokumen = fileTypes[fileName];
        const namaFile = file.originalname;
        const formatFile = path
          .extname(file.originalname)
          .substring(1)
          .toLowerCase(); // Remove dot and lowercase
        const pathFile = file.path;

        // Cek apakah dokumen sudah ada untuk mahasiswa ini
        const checkQuery =
          "SELECT id_dokumen FROM dokumen WHERE id_mahasiswa = ? AND jenis_dokumen = ?";

        db.query(
          checkQuery,
          [idMahasiswa, jenisDokumen],
          (err, checkResult) => {
            if (err) {
              console.error("Error checking existing document:", err);
              return res.json({
                success: false,
                message: "Gagal mengecek dokumen yang sudah ada",
              });
            }

            let query, values;

            if (checkResult.length > 0) {
              // UPDATE existing document
              query = `UPDATE dokumen SET nama_file=?, format_file=?, path_file=?, tanggal_upload=NOW(), status_verifikasi='Menunggu Verifikasi'
                   WHERE id_mahasiswa=? AND jenis_dokumen=?`;
              values = [
                namaFile,
                formatFile,
                pathFile,
                idMahasiswa,
                jenisDokumen,
              ];
              console.log(`Updating existing ${jenisDokumen} document`);
            } else {
              // INSERT new document
              query = `INSERT INTO dokumen (id_mahasiswa, jenis_dokumen, nama_file, format_file, path_file, status_verifikasi)
                   VALUES (?, ?, ?, ?, ?, 'Menunggu Verifikasi')`;
              values = [
                idMahasiswa,
                jenisDokumen,
                namaFile,
                formatFile,
                pathFile,
              ];
              console.log(`Inserting new ${jenisDokumen} document`);
            }

            db.query(query, values, (err, result) => {
              if (err) {
                console.error(`Error saving ${jenisDokumen} document:`, err);
                console.error("Error details:", {
                  code: err.code,
                  errno: err.errno,
                  sqlMessage: err.sqlMessage,
                  sqlState: err.sqlState,
                });
                return res.json({
                  success: false,
                  message:
                    `Gagal menyimpan dokumen ${jenisDokumen}: ` +
                    err.sqlMessage,
                });
              }

              uploadedDocuments.push({
                jenis_dokumen: jenisDokumen,
                nama_file: namaFile,
                format_file: formatFile,
                path_file: pathFile,
                operation: checkResult.length > 0 ? "update" : "insert",
              });

              uploadedCount++;
              console.log(
                `${jenisDokumen} document saved successfully. Progress: ${uploadedCount}/${totalFiles}`
              );

              // Jika semua file sudah diproses
              if (uploadedCount === totalFiles) {
                console.log("All documents uploaded successfully");
                console.log("Uploaded documents:", uploadedDocuments);

                const message =
                  totalFiles === 1
                    ? "Dokumen berhasil diupload"
                    : `${totalFiles} dokumen berhasil diupload`;

                res.json({
                  success: true,
                  message: message,
                  uploadedFiles: uploadedDocuments.length,
                  documents: uploadedDocuments,
                });
              }
            });
          }
        );
      });
    });
  }
);

// API Get Dokumen by Mahasiswa ID
app.get("/api/dokumen/:id_mahasiswa", (req, res) => {
  const { id_mahasiswa } = req.params;

  console.log("=== GET DOKUMEN DEBUG ===");
  console.log("Getting documents for mahasiswa ID:", id_mahasiswa);

  const query =
    "SELECT * FROM dokumen WHERE id_mahasiswa = ? ORDER BY jenis_dokumen";

  db.query(query, [id_mahasiswa], (err, results) => {
    if (err) {
      console.error("Database error getting documents:", err);
      return res.json({
        success: false,
        message: "Gagal mengambil data dokumen",
      });
    }

    console.log("Documents found:", results.length);
    console.log("Documents data:", results);

    res.json({
      success: true,
      data: results,
      totalDocuments: results.length,
    });
  });
});

// API Get Dokumen by User ID (melalui mahasiswa)
app.get("/api/dokumen-user/:userId", (req, res) => {
  const { userId } = req.params;

  console.log("=== GET DOKUMEN BY USER DEBUG ===");
  console.log("Getting documents for user ID:", userId);

  // Get mahasiswa ID terlebih dahulu
  const getMahasiswaQuery =
    "SELECT id_mahasiswa FROM mahasiswa WHERE id_pengguna = ?";

  db.query(getMahasiswaQuery, [userId], (err, mahasiswaResult) => {
    if (err) {
      console.error("Database error getting mahasiswa ID:", err);
      return res.json({
        success: false,
        message: "Gagal mendapatkan data mahasiswa",
      });
    }

    if (mahasiswaResult.length === 0) {
      console.log("Mahasiswa not found");
      return res.json({ success: true, data: [], totalDocuments: 0 });
    }

    const idMahasiswa = mahasiswaResult[0].id_mahasiswa;
    console.log("Mahasiswa ID:", idMahasiswa);

    // Get documents for this mahasiswa
    const query =
      "SELECT * FROM dokumen WHERE id_mahasiswa = ? ORDER BY jenis_dokumen";

    db.query(query, [idMahasiswa], (err, results) => {
      if (err) {
        console.error("Database error getting documents:", err);
        return res.json({
          success: false,
          message: "Gagal mengambil data dokumen",
        });
      }

      console.log("Documents found:", results.length);
      console.log("Documents data:", results);

      res.json({
        success: true,
        data: results,
        totalDocuments: results.length,
      });
    });
  });
});

// API Delete Dokumen
app.delete("/api/delete-dokumen/:dokumenId", (req, res) => {
  const { dokumenId } = req.params;

  console.log("=== DELETE DOKUMEN DEBUG ===");
  console.log("Deleting document ID:", dokumenId);

  const deleteQuery = "DELETE FROM dokumen WHERE id_dokumen = ?";

  db.query(deleteQuery, [dokumenId], (err, result) => {
    if (err) {
      console.error("Database error deleting document:", err);
      console.error("Error details:", {
        code: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState,
      });
      return res.json({
        success: false,
        message: "Gagal menghapus dokumen: " + err.sqlMessage,
      });
    }

    console.log(
      "Document deleted successfully, affected rows:",
      result.affectedRows
    );

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "Dokumen berhasil dihapus dari database",
        deletedRows: result.affectedRows,
      });
    } else {
      res.json({
        success: false,
        message: "Dokumen tidak ditemukan atau sudah dihapus",
      });
    }
  });
});

// API Save Form Data - Data Orang Tua
app.post("/api/save-orangtua", (req, res) => {
  const { userId, ...formData } = req.body;

  console.log("=== SAVE ORANG TUA DEBUG ===");
  console.log("Request body:", req.body);
  console.log("UserId:", userId);

  if (!userId) {
    console.log("Error: User ID tidak ditemukan");
    return res.json({ success: false, message: "User ID tidak ditemukan" });
  }

  // Get mahasiswa ID first
  const getMahasiswaQuery =
    "SELECT id_mahasiswa FROM mahasiswa WHERE id_pengguna = ?";

  db.query(getMahasiswaQuery, [userId], (err, mahasiswaResult) => {
    if (err) {
      console.error("Database error getting mahasiswa ID:", err);
      return res.json({
        success: false,
        message: "Gagal mendapatkan data mahasiswa",
      });
    }

    if (mahasiswaResult.length === 0) {
      console.log("Error: Mahasiswa tidak ditemukan");
      return res.json({
        success: false,
        message:
          "Data mahasiswa tidak ditemukan. Silakan lengkapi data pribadi terlebih dahulu.",
      });
    }

    const idMahasiswa = mahasiswaResult[0].id_mahasiswa;
    console.log("Mahasiswa ID:", idMahasiswa);

    // Check if orang tua data already exists
    const checkQuery =
      "SELECT id_orangtua FROM data_orangtua WHERE id_mahasiswa = ?";

    db.query(checkQuery, [idMahasiswa], (err, checkResult) => {
      if (err) {
        console.error("Database error checking existing data:", err);
        return res.json({
          success: false,
          message: "Gagal mengecek data existing",
        });
      }

      let query, values;

      if (checkResult.length > 0) {
        // UPDATE existing data
        query = `UPDATE data_orangtua SET
                 nama_ayah=?, pekerjaan_ayah=?, penghasilan_ayah=?, nohp_ayah=?, alamat_ayah=?,
                 nama_ibu=?, pekerjaan_ibu=?, penghasilan_ibu=?, nohp_ibu=?, alamat_ibu=?
                 WHERE id_mahasiswa=?`;
        values = [
          formData.namaAyah,
          formData.pekerjaanAyah,
          formData.penghasilanAyah,
          formData.nohpAyah,
          formData.alamatAyah,
          formData.namaIbu,
          formData.pekerjaanIbu,
          formData.penghasilanIbu,
          formData.nohpIbu,
          formData.alamatIbu,
          idMahasiswa,
        ];
        console.log("Updating existing orang tua data");
      } else {
        // INSERT new data
        query = `INSERT INTO data_orangtua
                 (id_mahasiswa, nama_ayah, pekerjaan_ayah, penghasilan_ayah, nohp_ayah, alamat_ayah,
                  nama_ibu, pekerjaan_ibu, penghasilan_ibu, nohp_ibu, alamat_ibu)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        values = [
          idMahasiswa,
          formData.namaAyah,
          formData.pekerjaanAyah,
          formData.penghasilanAyah,
          formData.nohpAyah,
          formData.alamatAyah,
          formData.namaIbu,
          formData.pekerjaanIbu,
          formData.penghasilanIbu,
          formData.nohpIbu,
          formData.alamatIbu,
        ];
        console.log("Inserting new orang tua data");
      }

      console.log("Query:", query);
      console.log("Values:", values);

      db.query(query, values, (err, result) => {
        if (err) {
          console.error("Database error saving orang tua data:", err);
          console.error("Error details:", {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState,
            sql: err.sql,
          });
          return res.json({
            success: false,
            message: "Gagal menyimpan data orang tua: " + err.sqlMessage,
            error: {
              code: err.code,
              message: err.message,
              sqlMessage: err.sqlMessage,
            },
          });
        }

        console.log("Orang tua data saved successfully");
        console.log("Query result:", result);
        const operation = checkResult.length > 0 ? "diperbarui" : "ditambahkan";
        res.json({
          success: true,
          message: `Data orang tua berhasil ${operation}`,
          operation: checkResult.length > 0 ? "update" : "insert",
          result: result,
        });
      });
    });
  });
});

// API Get Akademik Data
app.get("/api/akademik-data/:userId", (req, res) => {
  const { userId } = req.params;

  console.log("=== GET AKADEMIK DATA DEBUG ===");
  console.log("Getting akademik data for user ID:", userId);

  // Get mahasiswa ID first
  const getMahasiswaQuery =
    "SELECT id_mahasiswa FROM mahasiswa WHERE id_pengguna = ?";

  db.query(getMahasiswaQuery, [userId], (err, mahasiswaResult) => {
    if (err) {
      console.error("Database error getting mahasiswa ID:", err);
      return res.json({
        success: false,
        message: "Gagal mendapatkan data mahasiswa",
      });
    }

    if (mahasiswaResult.length === 0) {
      console.log("Mahasiswa not found");
      return res.json({ success: true, data: null });
    }

    const idMahasiswa = mahasiswaResult[0].id_mahasiswa;
    console.log("Mahasiswa ID:", idMahasiswa);

    // Get akademik data with jurusan and prodi names
    const akademikQuery = `
      SELECT da.*, 
             j.nama_jurusan, 
             p.nama_prodi
      FROM data_akademik da
      LEFT JOIN jurusan j ON da.id_jurusan = j.id_jurusan
      LEFT JOIN prodi p ON da.id_prodi = p.id_prodi
      WHERE da.id_mahasiswa = ?
    `;

    db.query(akademikQuery, [idMahasiswa], (err, akademikResult) => {
      if (err) {
        console.error("Database error getting akademik data:", err);
        return res.json({
          success: false,
          message: "Gagal mengambil data akademik",
        });
      }

      if (akademikResult.length === 0) {
        console.log("No akademik data found");
        return res.json({ success: true, data: null });
      }

      console.log("Akademik data found:", akademikResult[0]);
      res.json({ success: true, data: akademikResult[0] });
    });
  });
});

// API Get Orang Tua Data
app.get("/api/orang-tua-data/:userId", (req, res) => {
  const { userId } = req.params;

  console.log("=== GET ORANG TUA DATA DEBUG ===");
  console.log("Getting orang tua data for user ID:", userId);

  // Get mahasiswa ID first
  const getMahasiswaQuery =
    "SELECT id_mahasiswa FROM mahasiswa WHERE id_pengguna = ?";

  db.query(getMahasiswaQuery, [userId], (err, mahasiswaResult) => {
    if (err) {
      console.error("Database error getting mahasiswa ID:", err);
      return res.json({
        success: false,
        message: "Gagal mendapatkan data mahasiswa",
      });
    }

    if (mahasiswaResult.length === 0) {
      console.log("Mahasiswa not found");
      return res.json({ success: true, data: null });
    }

    const idMahasiswa = mahasiswaResult[0].id_mahasiswa;
    console.log("Mahasiswa ID:", idMahasiswa);

    // Get orang tua data
    const orangTuaQuery = "SELECT * FROM data_orangtua WHERE id_mahasiswa = ?";

    db.query(orangTuaQuery, [idMahasiswa], (err, orangTuaResult) => {
      if (err) {
        console.error("Database error getting orang tua data:", err);
        return res.json({
          success: false,
          message: "Gagal mengambil data orang tua",
        });
      }

      if (orangTuaResult.length === 0) {
        console.log("No orang tua data found");
        return res.json({ success: true, data: null });
      }

      console.log("Orang tua data found:", orangTuaResult[0]);
      res.json({ success: true, data: orangTuaResult[0] });
    });
  });
});

// API Submit Final (schema does not include status_akun; keep endpoint for flow)
app.post("/api/submit-final", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: "User ID tidak ditemukan" });
  }

  // No user table update necessary
  res.json({ success: true, message: "Data berhasil disubmit" });
});

// API Submit Application - Final submission
app.post("/api/submit-application", (req, res) => {
  const { userId } = req.body;

  console.log("=== SUBMIT APPLICATION DEBUG ===");
  console.log("User ID:", userId);

  if (!userId) {
    console.log("Error: User ID tidak ditemukan");
    return res.json({ success: false, message: "User ID tidak ditemukan" });
  }

  // Get mahasiswa ID first
  const getMahasiswaQuery =
    "SELECT id_mahasiswa FROM mahasiswa WHERE id_pengguna = ?";

  db.query(getMahasiswaQuery, [userId], (err, mahasiswaResult) => {
    if (err) {
      console.error("Database error getting mahasiswa ID:", err);
      return res.json({
        success: false,
        message: "Gagal mendapatkan data mahasiswa",
      });
    }

    if (mahasiswaResult.length === 0) {
      console.log("Error: Mahasiswa tidak ditemukan");
      return res.json({
        success: false,
        message:
          "Data mahasiswa tidak ditemukan. Silakan lengkapi data pribadi terlebih dahulu.",
      });
    }

    const idMahasiswa = mahasiswaResult[0].id_mahasiswa;
    console.log("Mahasiswa ID:", idMahasiswa);

    // Update tanggal submit
    const updateQuery =
      "UPDATE mahasiswa SET tanggal_daftar = NOW() WHERE id_mahasiswa = ?";

    db.query(updateQuery, [idMahasiswa], (err, result) => {
      if (err) {
        console.error("Error updating submission date:", err);
        return res.json({
          success: false,
          message: "Gagal menyimpan tanggal pengiriman",
        });
      }

      console.log(
        "Application submitted successfully for mahasiswa:",
        idMahasiswa
      );
      res.json({
        success: true,
        message: "Pendaftaran berhasil dikirim",
      });
    });
  });
});

// API Check Submission Status
app.get("/api/check-submission/:userId", (req, res) => {
  const { userId } = req.params;

  console.log("=== CHECK SUBMISSION STATUS DEBUG ===");
  console.log("User ID:", userId);

  if (!userId) {
    return res.json({ success: false, hasSubmitted: false });
  }

  // Check if mahasiswa has tanggal_daftar (means already submitted)
  const checkQuery = `
    SELECT id_mahasiswa, tanggal_daftar 
    FROM mahasiswa 
    WHERE id_pengguna = ? AND tanggal_daftar IS NOT NULL
  `;

  db.query(checkQuery, [userId], (err, results) => {
    if (err) {
      console.error("Database error checking submission:", err);
      return res.json({ success: false, hasSubmitted: false });
    }

    const hasSubmitted = results.length > 0;
    console.log("Query results:", results);
    console.log("Results length:", results.length);
    console.log("Has submitted:", hasSubmitted);

    if (hasSubmitted) {
      console.log("Submission date:", results[0].tanggal_daftar);
    }

    res.json({
      success: true,
      hasSubmitted: hasSubmitted,
      submissionDate: hasSubmitted ? results[0].tanggal_daftar : null,
    });
  });
});

// API Get User Data
app.get("/api/user-data/:userId", (req, res) => {
  const { userId } = req.params;

  // First try to get data from mahasiswa table (with complete registration data)
  const query = `SELECT m.*, u.email as username, u.nama_lengkap as user_nama_lengkap,
                 m.alamat_mahasiswa as alamat,  -- Map for frontend compatibility
                 m.id_provinsi as provinsi,     -- Map for frontend compatibility
                 m.id_kabupaten as kabupaten_kota, -- Map for frontend compatibility
                 m.id_kecamatan as kecamatan   -- Map for frontend compatibility
                 FROM mahasiswa m
                 LEFT JOIN user u ON m.id_pengguna = u.id_pengguna
                 WHERE m.id_pengguna = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ success: false, message: "Gagal mengambil data" });
    }

    if (results.length > 0) {
      // If found in mahasiswa table, get academic data too
      const userData = results[0];

      // Get academic data
      const academicQuery = `SELECT da.*, j.nama_jurusan, p.nama_prodi 
                            FROM data_akademik da
                            LEFT JOIN jurusan j ON da.id_jurusan = j.id_jurusan
                            LEFT JOIN prodi p ON da.id_prodi = p.id_prodi
                            WHERE da.id_mahasiswa = ?`;

      db.query(
        academicQuery,
        [userData.id_mahasiswa],
        (err, academicResults) => {
          if (err) {
            console.error("Database error getting academic data:", err);
            // Continue without academic data
          } else if (academicResults.length > 0) {
            // Merge academic data
            const academicData = academicResults[0];
            userData.asal_sekolah = academicData.asal_sekolah;
            userData.nilai_rata_rata = academicData.nilai_rata_rata;
            userData.tahun_lulus = academicData.tahun_lulus;
            userData.id_jurusan = academicData.id_jurusan;
            userData.id_prodi = academicData.id_prodi;
            userData.nama_jurusan = academicData.nama_jurusan;
            userData.nama_prodi = academicData.nama_prodi;
          }

          // Return user data with academic data
          if (userData.nama_lengkap) {
            res.json({ success: true, data: userData });
          } else if (userData.user_nama_lengkap) {
            userData.nama_lengkap = userData.user_nama_lengkap;
            res.json({ success: true, data: userData });
          } else {
            res.json({ success: true, data: userData });
          }
        }
      );
    } else {
      // If not found in mahasiswa table, get basic data from user table
      const userQuery =
        "SELECT id_pengguna as id, email as username, nama_lengkap, email, role FROM user WHERE id_pengguna = ?";

      db.query(userQuery, [userId], (err, userResults) => {
        if (err) {
          console.error("Database error:", err);
          return res.json({
            success: false,
            message: "Gagal mengambil data user",
          });
        }

        if (userResults.length === 0) {
          return res.json({ success: false, message: "User tidak ditemukan" });
        }

        // Return user data with default values for missing mahasiswa fields
        const userData = userResults[0];
        res.json({
          success: true,
          data: {
            ...userData,
            nama_lengkap: userData.nama_lengkap || userData.email,
            nik: null,
            tempat_lahir: null,
            tanggal_lahir: null,
            jenis_kelamin: null,
            agama: null,
            no_hp: null,
            alamat: null, // Frontend expects 'alamat'
            provinsi: null,
            kabupaten_kota: null, // Frontend expects 'kabupaten_kota'
            kecamatan: null,
            kode_pos: null,
            asal_sekolah: null,
            nilai_rata_rata: null,
            jurusan: null,
            prodi: null,
            alamat_sekolah: null,
            nama_ayah: null,
            pekerjaan_ayah: null,
            no_telp_ayah: null,
            pendidikan_ayah: null,
            nama_ibu: null,
            pekerjaan_ibu: null,
            no_telp_ibu: null,
            pendidikan_ibu: null,
            alamat_ortu: null,
            penghasilan_ortu: null,
            jumlah_tanggungan: null,
          },
        });
      });
    }
  });
});

// API Debug - Get User Data for Progress Check
app.get("/api/debug-user-data/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `SELECT * FROM mahasiswa WHERE id_pengguna = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ success: false, message: "Gagal mengambil data" });
    }

    console.log("=== DEBUG USER DATA ===");
    console.log("User ID:", userId);
    console.log("Mahasiswa data:", results);

    res.json({ success: true, data: results });
  });
});

// API Get User Progress Status
app.get("/api/user-progress/:userId", (req, res) => {
  const { userId } = req.params;

  console.log("=== USER PROGRESS DEBUG ===");
  console.log("Getting progress for user ID:", userId);

  // Check if user exists in mahasiswa table
  const checkUserQuery =
    "SELECT id_mahasiswa FROM mahasiswa WHERE id_pengguna = ?";

  db.query(checkUserQuery, [userId], (err, userResults) => {
    if (err) {
      console.error("Database error checking user:", err);
      return res.json({ success: false, message: "Gagal mengecek data user" });
    }

    if (userResults.length === 0) {
      // User not found in mahasiswa table - no progress
      console.log("User not found in mahasiswa table");
      return res.json({
        success: true,
        progress: {
          dataPribadi: false,
          dataAkademik: false,
          dataOrangTua: false,
          uploadDokumen: false,
          totalProgress: 0,
          completedSteps: 0,
          totalSteps: 4,
        },
      });
    }

    const idMahasiswa = userResults[0].id_mahasiswa;
    console.log("Mahasiswa ID:", idMahasiswa);

    // Check data pribadi completion
    const pribadiQuery = `SELECT 
      CASE WHEN nama_lengkap IS NOT NULL AND nama_lengkap != '' AND
                nik IS NOT NULL AND nik != '' AND
                tempat_lahir IS NOT NULL AND tempat_lahir != '' AND
                tanggal_lahir IS NOT NULL AND
                jenis_kelamin IS NOT NULL AND jenis_kelamin != '' AND
                agama IS NOT NULL AND agama != '' AND
                no_hp IS NOT NULL AND no_hp != '' AND
                email IS NOT NULL AND email != '' AND
                alamat_mahasiswa IS NOT NULL AND alamat_mahasiswa != ''
           THEN 1 ELSE 0 END as completed
      FROM mahasiswa WHERE id_pengguna = ?`;

    // Check data akademik completion - data akademik disimpan di tabel data_akademik
    const akademikQuery = `SELECT
      CASE WHEN da.id_akademik IS NOT NULL AND
                da.asal_sekolah IS NOT NULL AND da.asal_sekolah != '' AND
                da.id_jurusan IS NOT NULL AND
                da.tahun_lulus IS NOT NULL AND da.tahun_lulus != ''
           THEN 1 ELSE 0 END as completed
      FROM data_akademik da
      WHERE da.id_mahasiswa = ?`;

    // Check data orang tua completion
    const orangTuaQuery = `SELECT
      CASE WHEN do.id_orangtua IS NOT NULL
           THEN 1 ELSE 0 END as completed
      FROM data_orangtua do
      WHERE do.id_mahasiswa = ?`;

    // Check upload dokumen completion - cek tabel dokumen
    const dokumenQuery = `SELECT
      CASE WHEN COUNT(d.id_dokumen) >= 4  -- Cek apakah sudah upload 4 dokumen
           THEN 1 ELSE 0 END as completed
      FROM dokumen d
      JOIN mahasiswa m ON d.id_mahasiswa = m.id_mahasiswa
      WHERE m.id_pengguna = ?`;

    let completedQueries = 0;
    const totalQueries = 4;
    const progress = {
      dataPribadi: false,
      dataAkademik: false,
      dataOrangTua: false,
      uploadDokumen: false,
      totalProgress: 0,
      completedSteps: 0,
      totalSteps: 4,
    };

    // Execute all queries
    db.query(pribadiQuery, [userId], (err, pribadiResults) => {
      if (!err && pribadiResults.length > 0) {
        progress.dataPribadi = pribadiResults[0].completed === 1;
        console.log("Data Pribadi completed:", progress.dataPribadi);
      }
      completedQueries++;
      checkCompletion();
    });

    db.query(akademikQuery, [idMahasiswa], (err, akademikResults) => {
      if (!err && akademikResults.length > 0) {
        progress.dataAkademik = akademikResults[0].completed === 1;
        console.log("Data Akademik completed:", progress.dataAkademik);
      }
      completedQueries++;
      checkCompletion();
    });

    db.query(orangTuaQuery, [idMahasiswa], (err, orangTuaResults) => {
      if (!err && orangTuaResults.length > 0) {
        progress.dataOrangTua = orangTuaResults[0].completed === 1;
        console.log("Data Orang Tua completed:", progress.dataOrangTua);
      }
      completedQueries++;
      checkCompletion();
    });

    db.query(dokumenQuery, [userId], (err, dokumenResults) => {
      if (!err && dokumenResults.length > 0) {
        progress.uploadDokumen = dokumenResults[0].completed === 1;
        console.log("Upload Dokumen completed:", progress.uploadDokumen);
      }
      completedQueries++;
      checkCompletion();
    });

    function checkCompletion() {
      if (completedQueries === totalQueries) {
        // Calculate total progress
        progress.completedSteps = 0;
        if (progress.dataPribadi) progress.completedSteps++;
        if (progress.dataAkademik) progress.completedSteps++;
        if (progress.dataOrangTua) progress.completedSteps++;
        if (progress.uploadDokumen) progress.completedSteps++;

        progress.totalProgress = Math.round(
          (progress.completedSteps / progress.totalSteps) * 100
        );

        console.log("Final progress:", progress);
        res.json({ success: true, progress });
      }
    }
  });
});

// API Statistik - Improved with better error handling
app.get("/api/stats", (req, res) => {
  console.log("=== STATS DEBUG ===");

  // Function to check if table exists and get fallback values
  const getStatsData = () => {
    return new Promise((resolve) => {
      // First, try to get total mahasiswa
      const totalMahasiswaQuery =
        'SELECT COUNT(*) as count FROM user WHERE role = "mahasiswa"';

      db.query(totalMahasiswaQuery, (err, totalResults) => {
        let totalMahasiswa = 1250; // Default fallback

        if (!err && totalResults && totalResults.length > 0) {
          totalMahasiswa = totalResults[0].count;
          console.log("Total mahasiswa:", totalMahasiswa);
        } else {
          console.error("Error in totalMahasiswa query:", err);
        }

        // Check if mahasiswa table has prodi/jurusan columns
        const checkColumnsQuery = "SHOW COLUMNS FROM mahasiswa LIKE 'prodi'";

        db.query(checkColumnsQuery, (colErr, colResults) => {
          let programStudi = 42; // Default fallback
          let jurusan = 15; // Default fallback

          if (!colErr && colResults && colResults.length > 0) {
            // Columns exist, try to get real data
            const programStudiQuery =
              'SELECT COUNT(DISTINCT CASE WHEN prodi IS NOT NULL AND prodi != "" THEN prodi END) as count FROM mahasiswa';

            db.query(programStudiQuery, (progErr, progResults) => {
              if (!progErr && progResults && progResults.length > 0) {
                programStudi = progResults[0].count || 0;
                console.log("Program studi count:", programStudi);
              } else {
                console.error("Error in programStudi query:", progErr);
              }

              const jurusanQuery =
                'SELECT COUNT(DISTINCT CASE WHEN jurusan IS NOT NULL AND jurusan != "" THEN jurusan END) as count FROM mahasiswa';

              db.query(jurusanQuery, (jurErr, jurResults) => {
                if (!jurErr && jurResults && jurResults.length > 0) {
                  jurusan = jurResults[0].count || 0;
                  console.log("Jurusan count:", jurusan);
                } else {
                  console.error("Error in jurusan query:", jurErr);
                }

                const finalStats = {
                  totalMahasiswa: totalMahasiswa,
                  programStudi: programStudi,
                  jurusan: jurusan,
                };

                console.log("Final stats:", finalStats);
                resolve(finalStats);
              });
            });
          } else {
            console.log(
              "Columns prodi/jurusan don't exist, using fallback values"
            );
            const finalStats = {
              totalMahasiswa: totalMahasiswa,
              programStudi: programStudi,
              jurusan: jurusan,
            };
            console.log("Final stats (fallback):", finalStats);
            resolve(finalStats);
          }
        });
      });
    });
  };

  getStatsData()
    .then((stats) => {
      res.json(stats);
    })
    .catch((error) => {
      console.error("Stats error:", error);
      res.json({
        totalMahasiswa: 1250,
        programStudi: 42,
        jurusan: 15,
      });
    });
});

// API to fix login issues - Update old hashed passwords to plain text for testing
app.post("/api/fix-password", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email dan password harus diisi",
    });
  }

  const query = "UPDATE user SET password = ? WHERE email = ?";

  db.query(query, [password, email], (err, result) => {
    if (err) {
      console.error("Error updating password:", err);
      return res.json({
        success: false,
        message: "Gagal memperbarui password",
      });
    }

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "Password berhasil diperbarui",
      });
    } else {
      res.json({
        success: false,
        message: "Email tidak ditemukan",
      });
    }
  });
});

// API Dashboard Statistics - More comprehensive statistics
app.get("/api/dashboard-stats", (req, res) => {
  console.log("=== DASHBOARD STATS DEBUG ===");

  const queries = {
    // Total registered students
    totalStudents:
      'SELECT COUNT(*) as count FROM user WHERE role = "mahasiswa"',
    // Students with complete data
    completeProfiles:
      'SELECT COUNT(*) as count FROM mahasiswa WHERE nama_lengkap IS NOT NULL AND nama_lengkap != ""',
    // Students by status (if available)
    activeApplications:
      "SELECT COUNT(*) as count FROM mahasiswa WHERE tanggal_daftar IS NOT NULL",
    // Unique programs and majors using correct column names
    totalPrograms:
      'SELECT COUNT(DISTINCT CASE WHEN prodi IS NOT NULL AND prodi != "" THEN prodi END) as count FROM mahasiswa',
    totalMajors:
      'SELECT COUNT(DISTINCT CASE WHEN jurusan IS NOT NULL AND jurusan != "" THEN jurusan END) as count FROM mahasiswa',
    // Recent registrations (last 30 days)
    recentRegistrations:
      "SELECT COUNT(*) as count FROM mahasiswa WHERE tanggal_daftar >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
  };

  const stats = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;

  console.log("Running dashboard stats queries...");

  Object.keys(queries).forEach((key) => {
    const query = queries[key];
    console.log(`Executing ${key} query:`, query);

    db.query(query, (err, results) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        // Use fallback values on error
        const fallbackValues = {
          totalStudents: 1250,
          completeProfiles: 890,
          activeApplications: 1100,
          totalPrograms: 42,
          totalMajors: 15,
          recentRegistrations: 45,
        };
        stats[key] = fallbackValues[key] || 0;
      } else if (results && results.length > 0) {
        console.log(`${key} query result:`, results[0]);
        stats[key] = results[0].count || 0;
      } else {
        console.log(`${key} query returned no results`);
        stats[key] = 0;
      }

      completed++;
      console.log(`Completed ${completed}/${totalQueries} queries`);

      if (completed === totalQueries) {
        console.log("Final dashboard stats:", stats);
        res.json(stats);
      }
    });
  });
});

// Add missing columns to mahasiswa table
app.get("/api/setup-columns", (req, res) => {
  console.log("=== SETTING UP MISSING COLUMNS ===");

  const addColumns = [
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS asal_sekolah VARCHAR(255) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS nilai_rata_rata DECIMAL(5,2) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS jurusan VARCHAR(100) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS prodi VARCHAR(100) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS alamat_sekolah TEXT NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS nama_ayah VARCHAR(255) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS pekerjaan_ayah VARCHAR(100) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS no_telp_ayah VARCHAR(20) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS pendidikan_ayah VARCHAR(50) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS nama_ibu VARCHAR(255) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS pekerjaan_ibu VARCHAR(100) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS no_telp_ibu VARCHAR(20) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS pendidikan_ibu VARCHAR(50) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS alamat_ortu TEXT NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS penghasilan_ortu VARCHAR(50) NULL",
    "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS jumlah_tanggungan INT NULL",
  ];

  let completed = 0;
  const total = addColumns.length;

  addColumns.forEach((query, index) => {
    db.query(query, (err, result) => {
      completed++;
      if (err) {
        console.log(
          `Column ${index + 1} may already exist or error:`,
          err.sqlMessage || err
        );
      } else {
        console.log(`Column ${index + 1} added successfully`);
      }

      if (completed === total) {
        console.log("All columns setup completed!");

        // Add sample data
        const addSampleData = `
          INSERT INTO mahasiswa (id_pengguna, jurusan, prodi, tanggal_daftar)
          SELECT id_pengguna,
            CASE WHEN id_pengguna % 4 = 1 THEN 'Teknik Informatika'
                 WHEN id_pengguna % 4 = 2 THEN 'Sistem Informasi'
                 WHEN id_pengguna % 4 = 3 THEN 'Manajemen'
                 ELSE 'Akuntansi' END as jurusan,
            CASE WHEN id_pengguna % 4 = 1 THEN 'S1 Teknik Informatika'
                 WHEN id_pengguna % 4 = 2 THEN 'S1 Sistem Informasi'
                 WHEN id_pengguna % 4 = 3 THEN 'S1 Manajemen'
                 ELSE 'S1 Akuntansi' END as prodi,
            NOW()
          FROM user
          WHERE role = 'mahasiswa'
          AND id_pengguna NOT IN (SELECT id_pengguna FROM mahasiswa WHERE jurusan IS NOT NULL)
          LIMIT 10
          ON DUPLICATE KEY UPDATE
            jurusan = VALUES(jurusan),
            prodi = VALUES(prodi)
        `;

        db.query(addSampleData, (sampleErr, sampleResult) => {
          if (sampleErr) {
            console.error("Error adding sample data:", sampleErr);
          } else {
            console.log("Sample data added successfully!");
          }

          res.json({
            success: true,
            message: "Missing columns have been added and sample data inserted",
          });
        });
      }
    });
  });
});

// Debug endpoint to check table structure
app.get("/api/debug-tables", (req, res) => {
  console.log("=== DEBUG TABLE STRUCTURE ===");

  const checkMahasiswaTable = "SHOW COLUMNS FROM mahasiswa";
  const checkUserTable = "SHOW COLUMNS FROM user";

  db.query(checkMahasiswaTable, (err, mahasiswaResults) => {
    if (err) {
      console.error("Error checking mahasiswa table:", err);
      return res.json({
        error: "Error checking mahasiswa table",
        details: err,
      });
    }

    db.query(checkUserTable, (err, userResults) => {
      if (err) {
        console.error("Error checking user table:", err);
        return res.json({ error: "Error checking user table", details: err });
      }

      res.json({
        mahasiswa_columns: mahasiswaResults,
        user_columns: userResults,
      });
    });
  });
});

// Error handler untuk Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error dari multer
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file terlalu besar. Maksimal 2MB per file.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Jumlah file terlalu banyak.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "File tidak diharapkan.",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Error upload file: " + err.message,
    });
  } else if (err) {
    // Error lainnya (seperti dari fileFilter)
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Start server
app.listen(3000, "127.0.0.1", () => {
  console.log("========================================");
  console.log("Server running on http://localhost:3000");
  console.log("Database: pmb");
  console.log("Database Host: 44.220.144.82");
  console.log("========================================");
});

// API to reset submission status (for testing/debugging purposes)
app.post("/api/reset-submission/:userId", (req, res) => {
  const { userId } = req.params;

  console.log("=== RESET SUBMISSION STATUS ===");
  console.log("User ID:", userId);

  if (!userId) {
    return res.json({ success: false, message: "User ID is required" });
  }

  // Reset tanggal_daftar to NULL for this user
  const resetQuery = `
    UPDATE mahasiswa 
    SET tanggal_daftar = NULL 
    WHERE id_pengguna = ?
  `;

  db.query(resetQuery, [userId], (err, result) => {
    if (err) {
      console.error("Database error resetting submission:", err);
      return res.json({ success: false, message: "Database error" });
    }

    console.log("Reset result:", result);
    res.json({
      success: true,
      message: "Submission status reset successfully",
      affectedRows: result.affectedRows,
    });
  });
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  db.end((err) => {
    if (err) {
      console.error("Error closing database connections:", err);
    } else {
      console.log("All database connections closed");
    }
    process.exit(err ? 1 : 0);
  });
});

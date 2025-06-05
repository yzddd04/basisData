// Koneksi ke database
use library_management

// Hapus koleksi staffs jika sudah ada (opsional)
db.staffs.drop()

// Buat koleksi staffs baru
db.createCollection("staffs")

// Insert data dummy dengan password yang di-hash menggunakan bcrypt
// Password: 123
// Hash bcrypt untuk password "123"
db.staffs.insertMany([
  {
    name: "Admin User",
    email: "admin@library.com",
    password: "$2b$10$3euPcmQFCiblsZeEu5s7p.9BU8F8jS8N3t3bKGzdgTA83oZGDN9m2", // password: 123
    role: "Administrator",
    phone: "08123456789",
    address: "123 Admin Street, City",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Librarian User",
    email: "librarian@library.com",
    password: "$2b$10$3euPcmQFCiblsZeEu5s7p.9BU8F8jS8N3t3bKGzdgTA83oZGDN9m2", // password: 123
    role: "Librarian",
    phone: "08987654321",
    address: "456 Library Street, City",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Staff User",
    email: "staff@library.com",
    password: "$2b$10$3euPcmQFCiblsZeEu5s7p.9BU8F8jS8N3t3bKGzdgTA83oZGDN9m2", // password: 123
    role: "Staff",
    phone: "08765432109",
    address: "789 Staff Street, City",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// Verifikasi data yang telah diinsert
print("\nData yang telah diinsert:")
db.staffs.find({}, {password: 0}).pretty()

// Catatan: Password untuk semua akun adalah "123"
print("\nInformasi Login:")
print("1. Admin: admin@library.com / 123")
print("2. Librarian: librarian@library.com / 123")
print("3. Staff: staff@library.com / 123") 
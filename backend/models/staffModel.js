import bcrypt from 'bcryptjs';

export class Staff {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'librarian';
    this.phone = data.phone;
    this.joiningDate = data.joiningDate || new Date();
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  toJSON() {
    return {
      name: this.name,
      email: this.email,
      role: this.role,
      phone: this.phone,
      joiningDate: this.joiningDate,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
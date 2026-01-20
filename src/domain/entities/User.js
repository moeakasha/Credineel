/**
 * User Entity
 * Represents the core user domain model
 */
export class User {
  constructor({ id, email, name, createdAt }) {
    this.id = id
    this.email = email
    this.name = name
    this.createdAt = createdAt
  }

  static fromJSON(json) {
    return new User({
      id: json.id,
      email: json.email,
      name: json.name,
      createdAt: json.createdAt ? new Date(json.createdAt) : null,
    })
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt?.toISOString(),
    }
  }
}

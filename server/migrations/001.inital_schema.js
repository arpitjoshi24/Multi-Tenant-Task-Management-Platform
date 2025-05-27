import mongoose from 'mongoose';

export async function up() {
  const db = mongoose.connection;

  // Create collections with schemas
  await db.createCollection('organizations', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'code'],
        properties: {
          name: {
            bsonType: 'string',
            description: 'Organization name'
          },
          code: {
            bsonType: 'string',
            description: 'Unique organization code'
          },
          description: {
            bsonType: 'string',
            description: 'Optional organization description'
          },
          settings: {
            bsonType: 'object',
            properties: {
              theme: {
                bsonType: 'string',
                enum: ['light', 'dark']
              }
            }
          }
        }
      }
    }
  });

  await db.createCollection('users', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'email', 'password', 'role', 'organizationId'],
        properties: {
          name: {
            bsonType: 'string'
          },
          email: {
            bsonType: 'string'
          },
          password: {
            bsonType: 'string'
          },
          role: {
            enum: ['admin', 'manager', 'member']
          },
          organizationId: {
            bsonType: 'objectId'
          }
        }
      }
    }
  });

  await db.createCollection('tasks', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'status', 'priority', 'dueDate', 'createdBy', 'organizationId'],
        properties: {
          title: {
            bsonType: 'string'
          },
          description: {
            bsonType: 'string'
          },
          status: {
            enum: ['todo', 'in_progress', 'completed', 'expired']
          },
          priority: {
            enum: ['low', 'medium', 'high']
          },
          category: {
            enum: ['bug', 'feature', 'improvement', 'documentation', 'other']
          },
          dueDate: {
            bsonType: 'date'
          },
          assignedTo: {
            bsonType: 'objectId'
          },
          createdBy: {
            bsonType: 'objectId'
          },
          organizationId: {
            bsonType: 'objectId'
          }
        }
      }
    }
  });

  // Create indexes
  await db.collection('organizations').createIndex({ code: 1 }, { unique: true });
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ organizationId: 1 });
  await db.collection('tasks').createIndex({ organizationId: 1 });
  await db.collection('tasks').createIndex({ assignedTo: 1 });
  await db.collection('tasks').createIndex({ status: 1 });
  await db.collection('tasks').createIndex({ dueDate: 1 });
}

export async function down() {
  const db = mongoose.connection;
  await db.dropCollection('organizations');
  await db.dropCollection('users');
  await db.dropCollection('tasks');
}
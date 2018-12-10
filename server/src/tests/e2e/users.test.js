import './helpers/db';
import request from 'supertest';
import app from '../../routes/app';
import User from '../../models/User';
import { compare } from '../../utils/auth';
const { getUsers, usersSeedData, getAgencies } = require('./helpers/seedData');

describe('users routes', () => {
  it('signs a user up (with seed data helper)', () => {
    const createdUsers = getUsers();
    const users = usersSeedData();

    expect(createdUsers[0]).toEqual({
      agency: users[0].agency,
      email: users[0].email,
      role: users[0].role,
      _id: expect.any(String),
      createdDate: expect.anything(),
      passwordHash: expect.any(String)
    });
  });

  it('hashes a user\'s password', () => {
    const createdAgencies = getAgencies();

    return User.create({
      email: 'test@test.com',
      password: 'test',
      agency: createdAgencies[0]._id,
      role: 'family'
    }).then(user => {
      expect(user.passwordHash).not.toEqual('test');
      expect(compare('test', user.passwordHash));
    });
  });

  it('gets a list of all users', () => {
    const createdUsers = getUsers();

    return request(app)
      .get('/api/users')
      .then(res => {
        expect(res.body.length).toEqual(3);
        expect(res.body).toContainEqual(createdUsers[0]);
        expect(res.body).toContainEqual(createdUsers[1]);
        expect(res.body).toContainEqual(createdUsers[2]);
      });
  });

  it('gets a user by id', () => {
    const createdUsers = getUsers();

    return request(app)
      .get(`/api/users/${createdUsers[1]._id}`)
      .then(res => {
        expect(res.body).toEqual(createdUsers[1]);
      });
  });

  it('deletes a user by id', () => {
    const createdUsers = getUsers();

    return request(app)
      .delete(`/api/users/${createdUsers[1]._id}`)
      .then(() => request(app).get('/api/users'))
      .then(res => {
        expect(res.body).not.toContainEqual(createdUsers[1]);
        expect(res.body).toContainEqual(createdUsers[0]);
        expect(res.body).toContainEqual(createdUsers[2]);
      });
  });

  it('updates a user by id', () => {
    const createdUsers = getUsers();

    return request(app)
      .put(`/api/users/${createdUsers[0]._id}`)
      .send({
        role: 'nanny'
      })
      .then(res => {
        expect(res.body.role).toEqual('nanny');
      });
  });
});
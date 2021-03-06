import { Router } from 'express';
import User from '../../models/User';
import { HttpError } from '../../middleware/error';
import requireAuth from '../../middleware/requireAuth';
import Agency from '../../models/Agency';

export default Router()
  .post('/:agencyAlias/signup', (req, res, next) => {
    const { email, password, role } = req.body;
    const { agencyAlias } = req.params;
    Agency.findOne({ agencyAlias: agencyAlias }).then(agency => {
      User.create({ email, password, role, agency: agency._id })
        .then(user => {
          res.setHeader('X-AUTH-TOKEN', user.authToken());
          res.json(user);
        })
        .catch(next);
    });
  })
  .post('/signin', (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email })
      .then(user => {
        const correctPassword = user && user.compare(password);
        if(correctPassword) {
          res.setHeader('X-AUTH-TOKEN', user.authToken());
          user.getProfile()
            .then(profile => {
              res.json({ user, profile });
            });
        } else {
          next(
            new HttpError({
              code: 401,
              message: 'Bad email or password'
            })
          );
        }
      })
      .catch(next);
  })

  .get('/', (req, res, next) => {
    // require admin. only return users in agency
    User.find()
      .select({ __v: false })
      .then(users => res.json(users))
      .catch(next);
  })

  .get('/verify', requireAuth(['admin', 'family', 'nanny', 'owner']), (req, res) => {
    User.findById(req.user._id)
      .then(user => user.getProfile())
      .then(profile => res.json({ user: req.user, profile }));
  })

  .get('/:id', (req, res, next) => {
    const { id } = req.params;
    User.findById(id)
      .select({ __v: false })
      .then(user => res.json(user))
      .catch(next);
  })

  .delete('/', (req, res, next) => {
    // require auth and get the user id from there
    const { id } = req.params;
    User.findByIdAndDelete(id)
      .then(user => res.json({ removed: !!user }))
      .catch(next);
  })

  .put('/', (req, res, next) => {
    // require auth and get the user id from there
    // don't allow user to change their agency.
    const { id } = req.params;
    const { email, password, role, agency } = req.body;

    User.findByIdAndUpdate(id, { email, password, role, agency }, { new: true })
      .then(user => res.json(user))
      .catch(next);
  });

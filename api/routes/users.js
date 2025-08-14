const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const is = require('is_js');
const Roles = require('../db/models/Roles');
const Users = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const Response = require('../lib/Response');
const Enum = require('../config/Enum');
const CustomError = require('../lib/Error');
const jwt = require('jwt-simple');
const config = require('../config');
const auth = require('../lib/auth')();

const I18n = require('../i18n/i18nn'); // dosya adı gerçekten i18nn ise bırak
const i18n = new I18n(config.DEFAULT_LANG);



router.post('/register', async (req, res) => {
  const body = req.body;
  try {
    const userExists = await Users.findOne({});
    if (userExists) {

      return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);
    }

    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 'Validation Error!', 'email field must be filled.');
    if (!is.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 'Validation Error!', 'email field must be email.');
    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 'Validation Error!', 'password field must be filled.');
    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 'Validation Error!', 'password length must be greater than ' + Enum.PASS_LENGTH);
    }

    const password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    const createdUser = await Users.create({
      email: body.email,
      password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });

    const role = await Roles.create({
      role_name: Enum.SUPER_ADMIN,
      is_active: true,
      created_by: createdUser._id // <-- düzeltildi
    });

    await UserRoles.create({
      role_id: role._id,
      user_id: createdUser._id
    });

    return res
        .status(Enum.HTTP_CODES.CREATED)
        .json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    if (errorResponse && errorResponse.code) {
      return res.status(errorResponse.code).json(errorResponse);
    }
    return res.status(500).json({ code: 500, message: 'Bilinmeyen bir hata oluştu.', error: err.message || err });
  }
});

router.post('/auth', async (req, res) => {
  console.log('📦 BODY in /auth:', req.body);

  console.log('BODY >>>', req.headers['content-type'], req.body);

  try {
    const { email, password } = req.body;
    Users.validateFieldsBeforeAuth(email, password);

    const user = await Users.findOne({ email });
    if (!user) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, i18n.translate("COMMON.VALIDATION_ERROR_TITLE",config.DEFAULT_LANG),i18n.translate("USERS.AUTH_ERROR",config.DEFAULT_LANG));
    if (!user.validPassword(password)) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, i18n.translate("COMMON.VALIDATION_ERROR_TITLE",config.DEFAULT_LANG),i18n.translate("USERS.AUTH_ERROR",config.DEFAULT_LANG));

    const payload = {
      id: user._id,
      exp: Math.floor(Date.now() / 1000) + config.JWT.EXPIRE_TIME // <-- + ile düzeltildi
    };

    const token = jwt.encode(payload, config.JWT.SECRET);
    const userData = { _id: user._id, first_name: user.first_name, last_name: user.last_name };

    return res.json(Response.successResponse({ token, user: userData }));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    return res.status(errorResponse.code || 500).json(errorResponse);
  }
});

// Tüm rotaları koru
router.all('*', auth.authenticate(), (req, res, next) => next());

// Liste
router.get('/', auth.checkRoles('user_view'), async (req, res) => {
  try {
    const users = await Users.find({},{password:0}).lean();//burada eklenen password'e 0 atandığında users req'i gönderildiğinde sadece psw alanı görünmezken
    // eğer 1 alırsa aynı req gönderildiğinde bu sefer sadece id ve pasw alanı döndüürlmüş olur.

    for(let i=0;i<users.length;i++){
      let roles=await UserRoles.find({user_id,users[i]._id}).populate("role_id");
      users[i].roles=roles;

    }

    return res.json(Response.successResponse(users));
  }
  catch (err) {
    const errorResponse = Response.errorResponse(err);
    return res.status(errorResponse.code || 500).json(errorResponse);
  }
});

// Ekle
router.post('/add', auth.checkRoles('user_add'), async (req, res) => {
  const body = req.body;
  try {
    if (!body.email) {
      throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          i18n.translate('COMMON.FIELD_MUST_BE_FILLED', req.user?.language || config.DEFAULT_LANG, ['email']),
          'email field must be filled.'
      );
    }

    if (!is.email(body.email)) { // <-- parantez düzeltildi
      throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          i18n.translate('COMMON.FIELD_MUST_BE_EMAIL', req.user?.language || config.DEFAULT_LANG, ['email']),
          'email field must be email.'
      );
    }

    if (!body.password) {
      throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          i18n.translate('COMMON.FIELD_MUST_BE_FILLED', req.user?.language || config.DEFAULT_LANG, ['password']),
          'password field must be filled.'
      );
    }

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          i18n.translate('COMMON.FIELD_MIN_LENGTH', req.user?.language || config.DEFAULT_LANG, ['password', String(Enum.PASS_LENGTH)]),
          'password length must be greater than ' + Enum.PASS_LENGTH
      );
    }

    if (!Array.isArray(body.roles) || body.roles.length === 0) {
      throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          i18n.translate('COMMON.FIELD_MUST_BE_FILLED', req.user?.language || config.DEFAULT_LANG, ['roles']),
          'roles field must be an array.'
      );
    }

    const roles = await Roles.find({ _id: { $in: body.roles } });
    if (roles.length === 0) {
      throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          i18n.translate('COMMON.NOT_FOUND', req.user?.language || config.DEFAULT_LANG, ['roles']),
          'roles not found.'
      );
    }

    const password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    const user = await Users.create({
      email: body.email,
      password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });

    for (let i = 0; i < roles.length; i++) {
      await UserRoles.create({
        role_id: roles[i]._id,
        user_id: user._id
      });
    }

    return res
        .status(Enum.HTTP_CODES.CREATED)
        .json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    return res.status(errorResponse.code || 500).json(errorResponse);
  }
});


// Güncelle
router.post('/update', auth.checkRoles('user_update'), async (req, res) => {
  const body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.FIELD_MUST_BE_FILLED",req.user.language,[id]), '_id fields must be filled.');

    const updates = {};
    if (body.password && body.password.length >= Enum.PASS_LENGTH) {
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    }
    if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;
    if (body.first_name) updates.first_name = body.first_name;
    if (body.last_name) updates.last_name = body.last_name;
    if (body.phone_number) updates.phone_number = body.phone_number;

    if (Array.isArray(body.roles) && body.roles.length > 0) {
      const userRoles = await UserRoles.find({ user_id: body._id });
      const currentRoleIds = userRoles.map(r => r.role_id.toString());

      const removedRoles = userRoles.filter(x => !body.roles.includes(x.role_id.toString()));
      const newRoles = body.roles.filter(x => !currentRoleIds.includes(x));

      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removedRoles.map(r => r._id) } });
      }
      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          await UserRoles.create({ role_id: newRoles[i], user_id: body._id });
        }
      }
    }

    await Users.updateOne({ _id: body._id }, updates);
    return res.json(Response.successResponse({ success: true }));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    return res.status(errorResponse.code || 500).json(errorResponse);
  }
});

// Sil
router.post('/delete', auth.checkRoles('user_delete'), async (req, res) => {
  try {
    const body = req.body;
    if (!body._id) {
      throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          i18n.translate('COMMON.FIELD_MUST_BE_FILLED', req.user?.language || config.DEFAULT_LANG, ['_id']),
          '_id field must be filled.'
      );
    }

    await Users.deleteOne({ _id: body._id });
    await UserRoles.deleteMany({ user_id: body._id });

    return res.json(Response.successResponse({ success: true }));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    return res.status(errorResponse.code || 500).json(errorResponse);
  }
});


module.exports = router;

import React from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as yup from 'yup';

const signupSchema = yup.object().shape({
  email: yup.string()
    .email()
    .required(),
  password: yup.string()
    .required(),
});

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

const LoginForm = ({ onSubmit }) => (
  <Formik
    initialValues={{
      email: undefined,
      password: undefined,
    }}
    validateSchema={signupSchema}
    onSubmit={(values, { setSubmitting }) => {
      onSubmit(values);
      setSubmitting(false);
    }}
  >
    {({
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      handleSubmit,
      isSubmitting,
    }) => (
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Email</label>
          <div className="control has-icons-left">
            <input
              className={`input ${errors.email && touched.email && is-danger}`}
              type="email"
              name="email"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
            />
            <span className="icon is-small is-left">
              <i className="fa fa-envelope"></i>
            </span>
          </div>
          {errors.email && touched.email && (
            <p className="help is-danger">{errors.email}</p>
          )}
        </div>
        
        <div className="field">
          <label className="label">Password</label>
          <div className="control has-icons-left">
            <input
              className={`input ${errors.password && touched.password && is-danger}`}
              type="password"
              name="password"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
            />
            <span className="icon is-small is-left">
              <i className="fa fa-lock"></i>
            </span>
          </div>
          {errors.password && touched.password && (
            <p className="help is-danger">{errors.password}</p>
          )}
        </div>
        
        <div className="control">
          <button
            className="button is-primary"
            type="submit"
            disabled={isSubmitting}
          >
            Submit
          </button>
        </div>
      </form>
    )}
  </Formik>
);

LoginForm.propTypes = propTypes;

export default LoginForm;

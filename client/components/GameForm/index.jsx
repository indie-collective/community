import React from "react";
import PropTypes from 'prop-types';
import { Formik } from "formik";
import * as Yup from "yup";

const GameSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  about: Yup.string()
    .min(10, "Too Short!")
    .max(500, "Too Long!")
    .required("Required"),
  site: Yup.string().url("Invalid url")
});

const propTypes = {
  name: PropTypes.string,
  about: PropTypes.string,
  site: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

const defaultProps = {
  name: undefined,
  about: undefined,
  site: undefined,
}

const GameForm = ({ name, about, site, onSubmit }) => (
  <Formik
    initialValues={{ name, about, site }}
    validationSchema={GameSchema}
    onSubmit={(values, actions) => {
      onSubmit(values).then(
        () => {
          actions.setSubmitting(false);
          onClose();
        },
        error => {
          actions.setSubmitting(false);
          console.error(error);
          // actions.setErrors(transformMyRestApiErrorsToAnObject(error));
          // actions.setStatus({ msg: 'Set some arbitrary status or data' });
        }
      );
    }}
  >
    {({
      values,
      errors,
      status,
      touched,
      handleBlur,
      handleChange,
      handleSubmit,
      isSubmitting
    }) => (
      <form onSubmit={handleSubmit}>
        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Name</label>
          </div>
          <div className="field-body">
            <div className="field">
              <p className="control">
                <input
                  className="input is-large"
                  name="name"
                  type="text"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                />
              </p>
              {errors.name && touched.name && (
                <p className="help is-danger">{errors.name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">About</label>
          </div>
          <div className="field-body">
            <div className="field">
              <p className="control">
                <textarea
                  className="textarea"
                  name="about"
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  {values.about}
                </textarea>
              </p>
              {errors.about && touched.about && (
                <p className="help is-danger">{errors.about}</p>
              )}
            </div>
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Site</label>
          </div>
          <div className="field-body">
            <div className="field">
              <p className="control">
                <input
                  className="input is-normal"
                  name="site"
                  type="url"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.site}
                />
              </p>
              {errors.site && touched.site && (
                <p className="help is-danger">{errors.site}</p>
              )}
            </div>
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="field-label" />
          <div className="field-body">
            <div className="field">
              <div className="control">
                <button type="submit" className="button is-primary">
                  Create game
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    )}
  </Formik>
);

GameForm.propTypes = propTypes;
GameForm.defaultProps = defaultProps;

export default GameForm;

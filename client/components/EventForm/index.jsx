import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as yup from 'yup';

// import StructureSelect from 'components/CountrySelect';
// import CountrySelect from 'components/CountrySelect';

const eventSchema = yup.object().shape({
  name: yup.string()
    .required(),
  about: yup.string()
    .required(),
  startAt: yup.date()
    .required(),
  endAt: yup.date()
    .required(),
  structure: yup.string()
    .required(),
  country: yup.string()
    .required(),
  city: yup.string()
    .required(),
});

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

const EventForm = ({ onSubmit }) => (
  <Formik
    initialValues={{
      name: '',
      about: '',
      startAt: new Date(),
      endAt: new Date(),
      structure: '',
      country: '',
      city: '',
    }}
    validateSchema={eventSchema}
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
          <label className="label">Name</label>
          <div className="control">
            <input
              className={`input ${errors.name && touched.name && is-danger}`}
              type="string"
              name="name"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.name}
            />
          </div>
          {errors.name && touched.name && (
            <p className="help is-danger">{errors.name}</p>
          )}
        </div>

        <div className="field">
          <label className="label">About</label>
          <div className="control">
            <textarea
              className={`textarea ${errors.about && touched.about && is-danger}`}
              name="about"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.about}
            />
          </div>
          {errors.about && touched.about && (
            <p className="help is-danger">{errors.about}</p>
          )}
        </div>

        <div className="field">
          <label className="label">Structure</label>
          <div className="control">
            <input
              className={`input ${errors.structure && touched.structure && is-danger}`}
              type="string"
              name="structure"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.structure}
            />
          </div>
          {errors.structure && touched.structure && (
            <p className="help is-danger">{errors.structure}</p>
          )}
        </div>

        <div className="field">
          <label className="label">Start</label>
          <div className="control">
            <input
              className={`input ${errors.startAt && touched.startAt && is-danger}`}
              type="date"
              name="startAt"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.startAt}
            />
          </div>
          {errors.startAt && touched.startAt && (
            <p className="help is-danger">{errors.startAt}</p>
          )}
        </div>

        <div className="field">
          <label className="label">End</label>
          <div className="control">
            <input
              className={`input ${errors.endAt && touched.endAt && is-danger}`}
              type="date"
              name="startAt"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.endAt}
            />
          </div>
          {errors.endAt && touched.endAt && (
            <p className="help is-danger">{errors.endAt}</p>
          )}
        </div>

        <div className="field">
          <label className="label">Country</label>
          <div className="control">
            <input
              className={`input ${errors.country && touched.country && is-danger}`}
              type="string"
              name="country"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.country}
            />
          </div>
          {errors.country && touched.country && (
            <p className="help is-danger">{errors.country}</p>
          )}
        </div>

        <div className="field">
          <label className="label">City</label>
          <div className="control">
            <input
              className={`input ${errors.city && touched.city && is-danger}`}
              type="string"
              name="city"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.city}
            />
          </div>
          {errors.city && touched.city && (
            <p className="help is-danger">{errors.city}</p>
          )}
        </div>

        <div class="control">
          <button
            class="button is-primary"
            type="submit"
            disabled={isSubmitting}
          >
            Create event
          </button>
        </div>
      </form>
    )}
  </Formik>
);

EventForm.propTypes = propTypes;

export default EventForm;

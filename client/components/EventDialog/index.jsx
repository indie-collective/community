import React, { useState } from 'react';
import { useMutation } from 'urql';
import {
  Dialog,
  Pane,
  TextInput,
  TextInputField,
  Textarea,
  Autocomplete,
  FormField,
} from 'evergreen-ui';

import { countryOptions } from '../StructureDialog/countries';

import createEventMutation from '../../gql/createEvent';

const EventDialog = ({ visible, onClose }) => {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [startAt, setStartAt] = useState(new Date());
  const [endAt, setEndAt] = useState(new Date());
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const [createEvent] = useMutation(createEventMutation);

  return (
    <Dialog
      isShown={visible}
      title="Add Event"
      onConfirm={() => {
        createEvent({ name, about, startAt: startAt.toJSON(), endAt: endAt.toJSON(), country, city })
          .then(() => {
            onClose();
          });
      }}
      confirmLabel="Add event"
    >
      <Pane>
        <TextInputField
          label="Name"
          placeholder="Name…"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Textarea
          placeholder="About…"
          value={about}
          onChange={e => setAbout(e.target.value)}
        />
        <br />
        <br />
        <FormField
          labelFor="startAtDate"
          label="Starting time"
          isRequired
        >
          <input
            id="startAtDate"
            value={startAt.toJSON().split('T')[0]}
            type="date"
            min={startAt.toJSON().split('T')[0]}
            required
            onChange={(e) => {
              const newDate = new Date(e.target.value + 'T' + startAt.toJSON().split('T')[1]);
              setStartAt(newDate);
              
              if (startAt > endAt) {
                setEndAt(newDate);
              }
            }}
          />
          <input
            id="startAtTime"
            value={startAt.toJSON().match(/T(\d{2}:\d{2})/)[1]}
            type="time"
            required
            onChange={(e) => {
              console.log(e.target.value)
              setStartAt(new Date(startAt.toJSON().split('T')[0] + 'T' + e.target.value + ':00.000Z'));
            }}
          />
        </FormField>
        <FormField
          labelFor="endAtDate"
          label="Ending time"
          isRequired
        >
          <input
            id="endAtDate"
            value={endAt.toJSON().split('T')[0]}
            type="date"
            min={endAt.toJSON().split('T')[0]}
            required
            onChange={(e) => {
              setEndAt(new Date(e.target.value + 'T' + endAt.toJSON().split('T')[1]));
            }}
          />
          <input
            id="endAtTime"
            value={endAt.toJSON().match(/T(\d{2}:\d{2})/)[1]}
            type="time"
            required
            onChange={(e) => {
              setEndAt(new Date(endAt.toJSON().split('T')[0] + 'T' + e.target.value));
            }}
          />
        </FormField>
        <br />
        <Autocomplete
          label="country"
          items={countryOptions.map(d => d.text)}
          value={country}
          onChange={value => setCountry(value)}
        >
          {(props) => {
            const { getInputProps, getRef, inputValue, openMenu } = props
            return (
              <TextInput
                placeholder="Country"
                value={inputValue}
                innerRef={getRef}
                {...getInputProps({
                  onFocus: () => {
                    openMenu()
                  }
                })}
              />
            )
          }}
        </Autocomplete>
        <br />
        <TextInputField
          label="City"
          placeholder="City"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
      </Pane>
    </Dialog>
  );
}

export default EventDialog;

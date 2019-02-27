import React, { useState } from 'react';
import { useMutation } from 'urql';
import {
  Dialog,
  Pane,
  TextInput,
  Label,
  FormField,
  TextInputField,
  Textarea,
  Autocomplete,
} from 'evergreen-ui';

import { countryOptions } from '../countries';

import createEventMutation from '../../gql/createEvent';
import StructureSelect from '../StructureSelect';

const EventDialog = ({ visible, onClose }) => {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [startAt, setStartAt] = useState(new Date());
  const [endAt, setEndAt] = useState(new Date());
  const [structures, setStructures] = useState([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const createEvent = useMutation(createEventMutation)[1];

  return (
    <Dialog
      isShown={visible}
      title="Add event"
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
          label="What is this event called?"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Label
          htmlFor="about"
          marginBottom={4}
          display="block"
        >
          Tell us a bit more…
        </Label>
        <Textarea
          id="about"
          placeholder="Now, this is a story all about how my life got flipped-turned upside down…"
          value={about}
          onChange={e => setAbout(e.target.value)}
        />
        <br />
        <br />
        <Label
          htmlFor="structures"
          marginBottom={4}
          display="block"
        >
          Who is organizing it?
        </Label>
        <StructureSelect
          selected={structures}
          onChange={(elements) => setStructures(elements)}
        />

        <Pane display="flex">
          <FormField
            labelFor="startAtDate"
            label="Starts at…"
          >
            <input
              id="startAtDate"
              value={startAt.toJSON().split('T')[0]}
              type="date"
              min={startAt.toJSON().split('T')[0]}
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
              onChange={(e) => {
                setStartAt(new Date(startAt.toJSON().split('T')[0] + 'T' + e.target.value + ':00.000Z'));
              }}
            />
          </FormField>
          <FormField
            marginLeft={15}
            labelFor="endAtDate"
            label="Until…"
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
        </Pane>
        <br />

        <Label
          htmlFor="country"
          marginBottom={4}
          display="block"
        >
          Where in the world…?
        </Label>
        <Pane display="flex">
          <Autocomplete
            id="country"
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
          <TextInput
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
        </Pane>
      </Pane>
    </Dialog>
  );
}

export default EventDialog;

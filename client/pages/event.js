import React from 'react';
import { Heading, Pane, Paragraph, Spinner, Small } from 'evergreen-ui';
import { useQuery, useMutation } from 'urql';

import App from '../components/App';
import ImageUploader from '../components/ImageUploader';
import LoadingImage from '../components/LoadingImage';

import eventQuery from '../gql/event';

const addImageMutation = `
  mutation ($id: ID! $file: Upload!) {
    addImageToEvent(id: $id file: $file) {
      name
      about
      images {
        id
        mimetype
      }
    }    
  }
`;

const EventDialog = ({ id }) => {
  const [event] = useQuery({ query: eventQuery, variables: { id }});
  const addImage = useMutation(addImageMutation)[1];

  if (!event.data) {
    return (
      <App>
        <Spinner size={24} />
      </App>
    );
  }

  return (
    <App>
      <Pane maxWidth={800} margin="auto">
        <Pane display="flex">
          <Heading size={200} flex="1">EVENT</Heading>
          <Heading size={200} flex="1" textAlign="right">
            {new Date(event.data.event.startAt).toLocaleDateString()}
            {' to '}
            {new Date(event.data.event.endAt).toLocaleDateString()}
          </Heading>
        </Pane>

        <Pane display="flex" alignItems="baseline">
          <Heading size={900} flex="1">{event.data.event.name}</Heading>
          <Heading size={200}>{event.data.event.structures.map(({name}) => name).join(', ')}</Heading>
          <Heading size={600} flex="1" textAlign="right">
            {event.data.event.location.city}, {event.data.event.location.country}
          </Heading>
        </Pane>

        <Paragraph marginTop={20} marginBottom={20}>
          {event.data.event.about}
        </Paragraph>
        
        <Heading size={600}>Images</Heading>
        <ImageUploader
          onImage={file => {
            addImage({
              id: event.data.event.id,
              file,
            });
          }}
        >
          {event.data.event.images.map(({ id }) => (
            <Pane key={id} margin={10} display="inline-block">
              <LoadingImage src={`${location.protocol}//${location.host}/images/${id}`} height={100} />
            </Pane>
          ))}
        </ImageUploader>
      </Pane>
    </App>
  );  
}

export default EventDialog;

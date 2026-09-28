import { Center, ClientOnly, Spinner } from '@chakra-ui/react';

// Carousel.client is an empty module on the server (it imports enquire.js,
// which needs window), so it can only render after hydration. `children` is a
// function so the server never creates a <Carousel> element.
export default function ClientCarousel({ children }) {
  return (
    <ClientOnly
      fallback={
        <Center minH="240px">
          <Spinner size="lg" />
        </Center>
      }
    >
      {children}
    </ClientOnly>
  );
}

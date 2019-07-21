import React from 'react';
import { useQuery } from 'urql';

const statsQuery = `
  {
    allGames {
      totalCount
    }

    allEntities {
      totalCount
    }
    
    allEvents {
      totalCount
    }
    
    allPeople {
      totalCount
    }
    
    allTags {
      totalCount
    }
  } 
`;

const Home = () => {
  const stats = useQuery({
    query: statsQuery,
  })[0];

  return (
    <section className="hero">
      <div className="hero-body">
        <div className="container has-text-centered">
          <nav className="level is-mobile">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Games</p>
                <p className="title">
                  {stats.data && stats.data.allGames.totalCount}
                </p>
              </div>
            </div>

            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Entities</p>
                <p className="title">
                  {stats.data && stats.data.allEntities.totalCount}
                </p>
              </div>
            </div>

            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Tags</p>
                <p className="title">
                  {stats.data && stats.data.allTags.totalCount}
                </p>
              </div>
            </div>

            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Events</p>
                <p className="title">
                  {stats.data && stats.data.allEvents.totalCount}
                </p>
              </div>
            </div>

            <div className="level-item has-text-centered">
              <div>
                <p className="heading">People</p>
                <p className="title">
                  {stats.data && stats.data.allPeople.totalCount}
                </p>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default Home;

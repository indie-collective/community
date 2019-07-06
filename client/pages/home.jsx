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
    <section className="hero is-primary">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1 className="title">Community</h1>

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

          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
            aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
            eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est,
            qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit,
            sed quia non numquam eius modi tempora incidunt ut labore et dolore
            magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
            nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut
            aliquid ex ea commodi consequatur? Quis autem vel eum iure
            reprehenderit qui in ea voluptate velit esse quam nihil molestiae
            consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla
            pariatur?
          </p>
        </div>
      </div>
    </section>
  );
};

export default Home;

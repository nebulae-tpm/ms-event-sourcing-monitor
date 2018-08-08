import gql from "graphql-tag";

// We use the gql tag to parse our query string into a query document

export const getTimeFrameInRangeSince = gql`
  query getTimeFrameInRangeSince(
    $timeFrameType: EventSourcingMonitorTimeFrameType!
    $initTimestamp: BigInt!
    $quantity: Int!
  ) {
    getTimeFramesSinceTimestampFromEventSourcingMonitor(
      timeFrameType: $timeFrameType
      initTimestamp: $initTimestamp
      quantity: $quantity
    ) {
      id
      globalHits
      eventTypeHits {
        key
        value
      }
      aggregateTypeHits{
        key
        value
      }
      userHits {
        key
        value
      }
      eventTypes {
        key
        value {
          key
          value {
            key
          value
        }
      }
    }
  }
  }
`;





//Hello world sample, please remove
export const EventSourcingMonitorHelloWorldSubscription = gql`
  subscription {
    EventSourcingMonitorHelloWorldSubscription {
      sn
    }
  }`;

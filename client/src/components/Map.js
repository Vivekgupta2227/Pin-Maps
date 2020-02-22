import React , {useState, useEffect,useContext} from "react";
import { withStyles } from "@material-ui/core/styles";
import ReactMapGL ,{NavigationControl,Marker,Popup} from 'react-map-gl';
import PinIcon from './PinIcon';
import Context from '../context';
import Blog from './Blog';
import {unstable_useMediaQuery as useMediaQuery} from '@material-ui/core/useMediaQuery';
import {useClient} from '../client';
import { GET_PINS_QUERY } from "../graphql/queries";
import { DELETE_PIN_MUTATION } from '../graphql/mutations';
import {Subscription} from 'react-apollo';
// import differenceInMinutes from 'date-fns/difference_in_minutes';
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";
import {PIN_ADDED_SUBSCRIPTION,PIN_DELETED_SUBSCRIPTION,PIN_UPDATED_SUBSCRIPTION} from '../graphql/subscriptions';



const Map = ({ classes }) => {
  const INITIAL_VIEWPORT = {
    latitude:28.7041,
    longitude:77.1025,
    zoom:11
  };
  const mobileSize = useMediaQuery('(max-width:650px)')
  useEffect(()=>{
    getUserPosition()
  },[])
  useEffect(() => {
    getPins();
  },[]);
  const client = useClient()
  const {state,dispatch} = useContext(Context)
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT)
  const [userPosition, setuserPosition] = useState(null)
  const [popup,setPopup] = useState(null)

  useEffect(()=>{
    const pinExists = popup && state.pins.findIndex(pin => pin._id === popup._id) > -1
    if(!pinExists){
      setPopup(null)
    }
  },[state.pins.length])
  
  const getPins = async () =>{
      const {getPins} = await client.request(GET_PINS_QUERY)
     dispatch({type:"GET_PINS",payload:getPins})
      
  }
  const getUserPosition = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position=>{
        const {latitude , longitude} = position.coords
        setViewport({...viewport,latitude,longitude})
        setuserPosition({latitude,longitude})
      })
    }
  }
  const handleMapClick = ({lngLat,leftButton}) => {
    console.log(lngLat);
    
    if (!leftButton) return
    if(!state.draft){
      dispatch({type:"CREATE_DRAFT"})
    }      
    const [longitude,latitude] = lngLat
    dispatch({
      type:"UPDATE_DRAFT_LOCATION",
      payload:{longitude,latitude}
    })
    
  }
  const handleSelectPin = pin => {
    setPopup(pin)
    dispatch({type:"SET_PIN",payload:pin})
  }
  const isAuthUser = () => state.currentUser._id === popup.author._id;

  const handleDeletePin = async pin =>{
    const variables = {pinId : pin._id}
    await client.request(DELETE_PIN_MUTATION,variables)
    setPopup(null)
  }
  // const highlightNewPin = pin => {
  //   const isNewPin = differenceInMinutes(Date.now(),Number(pin.CreatedAt)) <= 30
  //   return isNewPin ? "pink" : "purple";
  // }
  return (
    <div className={mobileSize? classes.rootMobile:classes.root}>
    <ReactMapGL
    width="100vw"
    height="88vh"
    mapStyle={'mapbox://styles/mapbox/streets-v11'}
    mapboxApiAccessToken="pk.eyJ1Ijoidml2ZWsyMjI3Z3VwdGEiLCJhIjoiY2s2ZGpxcWw5MWo1YzNqcWo5Zm83Z3p1MiJ9.nt7wRO8epNzUtnNCwycg2w"
    onViewportChange={viewport=>setViewport(viewport)}
    scrollZoom={!mobileSize}
    onClick={handleMapClick}
    {...viewport}
    >
      <div className={classes.navigationControl}>
        <NavigationControl
         onViewportChange={newViewport=>setViewport(newViewport)}/>
      </div>
      {userPosition&&(
        <Marker
        latitude={userPosition.latitude}
        longitude={userPosition.longitude}
        offsetLeft={-19}
        offsetTop={-37}
        >
        <PinIcon size={40} color="darkblue"/>
        </Marker>
      )}
      {state.draft&&(
          <Marker
        latitude={state.draft.latitude}
        longitude={state.draft.longitude}
        offsetLeft={-19}
        offsetTop={-37}
        >
        <PinIcon size={40} color="darkBlue"/>
        </Marker>
        )}

        {state.pins.map(pin => (
          <Marker
          key={pin._id}
          latitude={pin.latitude}
          longitude={pin.longitude}
          offsetLeft={-19}
          offsetTop={-37}
          >
          <PinIcon
          size={40}
          color={"red"}
          onClick={()=>handleSelectPin(pin)} />
          </Marker>
        ))}
        {popup&&(
          <Popup
            anchor="top"
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={()=>setPopup(null)}
            >
              <img
              className={classes.popupImage}
              src={popup.image}
              alt={popup.title} 
              />
              <div className={classes.popupTab} >
                <Typography>
                  {popup.latitude.toFixed(6)},{popup.longitude.toFixed(6)}
                </Typography>
              {isAuthUser() && (
                <Button onClick={() => handleDeletePin(popup)}>
                  <DeleteIcon className={classes.deleteIcon} />
                </Button>
              )}  
              </div>
          </Popup>
        )}
    </ReactMapGL> 
    <Subscription
        subscription={PIN_ADDED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinAdded } = subscriptionData.data;
          console.log({ pinAdded });
          dispatch({ type: "CREATE_PINS", payload: pinAdded });
        }}
      />
      <Subscription
        subscription={PIN_UPDATED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinUpdated } = subscriptionData.data;
          console.log({ pinUpdated });
          dispatch({ type: "CREATE_COMMENT", payload: pinUpdated });
        }}
      />
      <Subscription
        subscription={PIN_DELETED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinDeleted } = subscriptionData.data;
          console.log({ pinDeleted });
          dispatch({ type: "DELETE_PIN", payload: pinDeleted });
        }}
      />

    <Blog /> 
  </div>
  )
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "black"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);


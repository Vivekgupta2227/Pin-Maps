import React, { useState, useContext } from "react";
import axios from "axios";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddAPhotoIcon from "@material-ui/icons/AddAPhotoTwoTone";
import LandscapeIcon from "@material-ui/icons/LandscapeOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/SaveTwoTone";
import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery";

import Context from "../../context";
import { useClient } from "../../client";
import { CREATE_PIN_MUTATION } from "../../graphql/mutations";

const CreatePin = ({ classes }) => {
  const client = useClient();
  const { state, dispatch } = useContext(Context);
  const mobileSize = useMediaQuery("(max-width:600px)");
  const [title, setTitle] = useState("Test Title");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDeleteDraft = () => {
    setTitle("");
    setImage("");
    setContent("");
    dispatch({ type: "DELETE_DRAFT" });
  };

  const handleImageUpload = async () => {
    const data = new FormData();
    data.append("file",image)
    data.append("upload_preset","geoPins")
    data.append("cloud_name","geopinsimages")
    const res = await axios.post("https://api.cloudinary.com/v1_1/geopinsimages/image/upload",data)
    return res.data.url;
  };

  const handleSubmit = async event => {
    try {
      event.preventDefault();
      setSubmitting(true);
      const url = await handleImageUpload();
      const { latitude, longitude } = state.draft;
      const variables = { title, image: url, content, latitude, longitude };
      client.request(CREATE_PIN_MUTATION, variables);

      // Now that we have GraphQL subscriptions, we don't need the following
      // const { createPin } = await client.request(
      //   CREATE_PIN_MUTATION,
      //   variables
      // );
      // dispatch({ type: "CREATE_PIN", payload: createPin });

      handleDeleteDraft();
    } catch (err) {
      setSubmitting(false);
      console.error("Error creating pin", err);
    }
  };

  return (
    <form className={classes.form}>
      <Typography
        className={classes.alignCenter}
        component="h2"
        variant="h4"
        color="primary"
        margin="normal"
        padding="normal"
      >
        <LandscapeIcon className={classes.iconLarge} />
        Pin a Location
      </Typography>
      <div>
        <TextField
          name="title"
          lable="Title"
          placeholder="Insert Pin Title"
          margin = "normal"
          onChange={e => setTitle(e.target.value)}
        />
        <input
          accept="images/*"
          id="image"
          type="file"
          className={classes.input}
          onChange={e => setImage(e.target.files[0])}
        />
        <label htmlFor="image">
          <Button
            style={{ color: image && "blue" }}
            component="span"
            size="small"
            className={classes.button}
          >
            <AddAPhotoIcon />
          </Button>
        </label>
      </div>
      <div className={classes.contentField}>
        <TextField
          name="content"
          label="Content"
          multiline
          rows={mobileSize ? "3" : "6"}
          margin="normal"
          fullWidth
          variant="outlined"
          onChange={e => setContent(e.target.value)}
        />
      </div>
      <div>
        <Button
          onClick={handleDeleteDraft}
          className={classes.button}
          variant="contained"
          color="primary"
        >
          <ClearIcon className={classes.leftIcon} />
          Discard
        </Button>
        <Button
          type="submit"
          className={classes.button}
          variant="contained"
          color="secondary"
          disabled={!title.trim() || !content.trim() || !image || submitting}
          onClick={handleSubmit}
        >
          <SaveIcon className={classes.rightIcon} />
          Submit
        </Button>
      </div>
    </form>
  );
};

const styles = theme => ({
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: theme.spacing.unit
  },
  contentField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "95%"
  },
  input: {
    display: "none"
  },
  alignCenter: {
    display: "flex",
    alignItems: "center"
  },
  iconLarge: {
    fontSize: 40,
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    fontSize: 20,
    marginLeft: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
    marginLeft: 0
  }
});

export default withStyles(styles)(CreatePin);

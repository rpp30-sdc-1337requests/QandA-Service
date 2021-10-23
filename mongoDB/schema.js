const questionSchema = mongoose.Schema({
  questionID: Number, //primary key
  questionBody: String,
  productID: Number,
  username: String,
  email: String,
  helpful: Boolean,
  reported: Boolean
});

const answerSchema = mongoose.Schema({
  ID: Number,
  questionID: String, //foreign key
  productID: Number,
  username: String,
  email: String,
  photos: String,
  helpful: Boolean,
  reported: Boolean
});
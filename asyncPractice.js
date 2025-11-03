// const asyncPromise = new Promise((resolve, reject) => {
//   const state = false;

//   if (state === true) {
//     resolve("Promise Resolved");
//   } else {
//     reject("Promise Rejected");
//   }
// });

// const asyncHandler = (func) => {
//   return () => {
//     return new Promise((resolve) => {
//       resolve(func()).catch((error) => {
//         throw error;
//       });
//     });
//   };
// };

// const functionHandler = asyncHandler(async () => {
//   //only the function is passed as the parameter
//   const result = await asyncPromise;
//   return result;
// });

// functionHandler().catch((error) => console.log("Async error", error));

// const ErrorPromise = new Promise((resolve, reject) => {
//   const status = false;
//   if (status === true) {
//     resolve("Promise is Resolved");
//   } else {
//     throw error;
//   }
// });

// ErrorPromise.catch((error) => console.log("Thrown Error: ", error));

// functionResult.catch((error) => console.log("Async handler rejects:", error));

// const asyncFunction = async () => {
//   try {
//     const result = await asyncPromise;
//     return result;
//   } catch (error) {
//     console.log("Await error", error);
//   }
// };

// const asyncResult = asyncFunction();
// asyncResult.then((response) => console.log("Async Result:", response));
// asyncResult.catch((error) => console.log(error));

const Strings = ["Abc", "Def", "Ghi      adas    ", ""];

// const condition = Strings.some((str) => str?.trim() === "");
// console.log(condition);
// Strings.some((str) => console.log(str?.trim()));

//Api Error Handling
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

//Helps in creating new erros.
// const error = new ApiError("404", "User not found");
// console.log(error);

//Instead of crashing and stopping the flow of the program Async handler helps in catching the error.
//Step 1:Creating asyncHandler
const asyncHandler = (asyncFunc) => {
  return () => {
    Promise.resolve(asyncFunc()).catch((error) =>
      console.log("User can't be fetched")
    );
  };
};

//Step 2: Understanding how Promise.resolve works
const dbFetch = async () => {
  // throw new Error("Error connecting to db");
  const data = await fetch("https://ap26");

  if (data) {
    console.log(data);
  }
};

// Promise.resolve(dbFetch()).catch((error) =>
//   console.log("Promise can't be resolved")
// );

//Step 3: Running the asyncHandler
//There are two ways of running asyncHandler

//1
// const registerUser = asyncHandler(dbFetch);

//2
const registerUser = asyncHandler(async () => {
  // throw new Error("Error connecting to db");
  const data = await fetch("https://ap26");

  if (data) {
    console.log(data);
  }
});

// registerUser();

const toggleSwitch = false;

console.log(!toggleSwitch);

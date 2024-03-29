db.createCollections("nonfictions",{
    validator:{
        $jsonSchema:{
            required:["name","price"],
            properties:{
                name:{
                    bsonType:"string",
                    descriptions:"must be a string and required"
                },
                price:{
                    bsonType:"number",
                    descriptions:"must be a number and required"
                }
            }
        }
    },
    validationAction:"error"
});
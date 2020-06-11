    <!-- ===================================================== -->
    <!-- ================== DATABASE SCRIPTS ================= -->
    <!-- ===================================================== -->
        var HOST = 'DANS';
        var DOWNLOAD_FILE_NAME = 'assessment_answers.csv';

        /* ---------------- Initialize database ---------------- */
        firebase.initializeApp(firebaseConfig);

        /* ---------------- Write to database ---------------- */

        function submit_page() {
            if (valid_input()) {
                firebase.auth().signInAnonymously()
                .then(function() {
                    let answers = get_answers();
                    writeToSheet(answers);
                })
                .catch(function(error) {
                    write_to_modal("SIGN IN", error.message + "  " +  error.code);
                });
            }
        }

        function writeToSheet(answers) {
            var hostRef = firebase.database().ref('/assessment tool answers/' + HOST);
            let m = JSON.parse(answers);
            hostRef.push(m, function(error) {
                if (error) {
                    write_to_modal("SUBMISSION", error.message);
                } else {
                    let submitted = "Answers were succesfully submitted into the database." + "<br><br>"
                    let advice = get_negative_answers().length > 0 ?
                        "When you print the assessment, you will find some advice concerning the questions that you answered with 'No'." + "<br><br>" : "";
                    let thanks = "Thank you for your participation!";
                    write_to_modal("SUBMISSION", submitted + advice + thanks);
                }
            })
        }

        /* ---------------- Download database ---------------- */
        function read_database() {
            let email = prompt("Your email\n (download is restricted to administrators) ", "");
            if (email) {
                let password = prompt("password", "");
                firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function() {
                    download();
                 })
                 .catch(function(error) {
                    write_to_modal("SIGN IN", error.message + "  " +  error.code);
                });
            }
        }

        function download() {
            var answers = [];
            var ref = firebase.database().ref("assessment tool answers/");
            ref.on("value", function(snapshot) {
                snapshot.forEach(function(organizationSnapshot) {
                    organizationSnapshot.forEach(function(childSnapshot) {
                        var a = childSnapshot.val();
                        answers.push(organizationSnapshot.key + "," + a.date + "," +
                                        a.yq1 + "," + a.yq2 + "," + a.yq3 + "," +
                                        a.fq1 + "," + a.fq2 + "," + a.fq3 + "," +
                                        a.aq1 + "," + a.aq2 + "," +
                                        a.iq1 + "," + a.iq2 + "," +
                                        a.rq1 + "," + a.rq2 + "," + a.rq3 + "," + a.rq4 + "," + a.rq5 + "," +
                                        a.qq1 + "," + a.qq2 + "," + a.qq3 + "," + a.qq4
                                    );
                    });
                });
                downloadAnswers(answers);
            });
        }

        function downloadAnswers(answers) {
            var csv = 'Host, Date, Domain, Role, Organization, FQ1, FQ2, FQ3, AQ1, AQ2, IQ1, IQ2, RQ1, RQ2, RQ3, RQ4, RQ5, Not relevant, Missing metrics, General feedback, Awareness raised\n';
            answers.forEach(function(row) {
                csv += row + "\n";
            })
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = DOWNLOAD_FILE_NAME;
            hiddenElement.click();
        }
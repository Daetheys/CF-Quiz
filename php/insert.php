<?php

include 'connectDB.php';

$prolific_id             = stripslashes(htmlspecialchars($_POST['prolificID']));
$cond                    = stripslashes(htmlspecialchars($_POST['cond']));
$id_question             = stripslashes(htmlspecialchars($_POST['questionID']));
$idpack                  = stripslashes(htmlspecialchars($_POST['packID']));
$question                = stripslashes(htmlspecialchars($_POST['question']));
$id_question_ex             = stripslashes(htmlspecialchars($_POST['questionIDEx']));
$idpack_ex                  = stripslashes(htmlspecialchars($_POST['packIDEx']));
$question_ex                = stripslashes(htmlspecialchars($_POST['questionEx']));
$answer                  = stripslashes(htmlspecialchars($_POST['answer']));
$answer_ex                  = stripslashes(htmlspecialchars($_POST['answer_ex']));
$prob                    = stripslashes(htmlspecialchars($_POST['prob']));
$initval                 = stripslashes(htmlspecialchars($_POST['initVal']));
$rt                      = stripslashes(htmlspecialchars($_POST['rt']));

try {
  $answer = mysqli_real_escape_string($db, $answer);
  $question = mysqli_real_escape_string($db, $question);
  $title =  mysqli_real_escape_string($db, $title);
} catch (Exception $e) {
;
}

if ($db->connect_error) {
  die("Connection failed: " . $db->connect_error);
}
# '$variable' if string, otherwise $variable
$sql = "INSERT INTO nicolas_cf_llm (prolific_id, cond, id_question, id_pack, question, id_question_ex, id_pack_ex, question_ex, answer, answer_ex, prob, initval, rt, time) VALUES ('$prolific_id', '$cond', $id_question, $idpack, '$question', $id_question_ex, $id_pack_ex, '$question_ex', '$answer', '$answer_ex', '$prob', '$initval', $rt, NOW())";

if ($db->query($sql) === TRUE) {
  echo "New record created successfully";

} else {
  echo "Error: " . $sql . "<br>" . $db->error;
  header('HTTP/1.1 500 Internal Server Booboo');
  header('Content-Type: application/json; charset=UTF-8');
  die(json_encode(array('message' => 'ERROR', 'code' => 1337)));
}

$db->close();
?>
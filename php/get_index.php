<?php

include 'connectDB.php';

$maxint = stripslashes(htmlspecialchars($_POST['maxInt']));
$maxit = 5;

$keys = array_fill(0,256,0)

$query= $db->query("SELECT DISTINCT index_bloc FROM nicolas_cf_index");
    
while ($row = $query->fetch_row()){
    unset($keys[$row['index_bloc']]);
    continue;
}

$db->close();

echo json_encode(array_pop($keys));

?>
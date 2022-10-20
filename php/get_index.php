<?php

include 'connectDB.php';

$keys = array_fill(0,256,0);

$query= $db->query("SELECT DISTINCT index_bloc FROM nicolas_cf_index");
if (!query)
    die("Database didn't work");
while ($row = $query->fetch_row()){
    unset($keys[$row['0']]);
}

$db->close();

$value = reset($keys);
$key = key($keys);
if ($key){
    echo json_encode($key);
}else{
    echo json_encode(0);
}
?>
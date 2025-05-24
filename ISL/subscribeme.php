<?php
  
   $url = 'http://www.islearning.org/mail/subscribe.php';
   $params = array("email" => trim($_GET['email'])); //you must know what you want to post
   $user_agent = "Mozilla/5.0 (compatible; MSIE 5.01; Windows NT 5.0)";
   $ch = curl_init();
   curl_setopt($ch, CURLOPT_POST,1);
   curl_setopt($ch, CURLOPT_POSTFIELDS,$params);
   curl_setopt($ch, CURLOPT_URL,$url);
   curl_setopt($ch, CURLOPT_USERAGENT, $user_agent);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);

   $result=curl_exec ($ch);
   curl_close ($ch);

   echo "".$result;
?>
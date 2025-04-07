<?php

$recipient = "benjaminjamesmatthew@gmail.com";
$reply = "benjaminjamesmatthew@gmail.com";
$subject = "ISLearning contact form";

$error = array();

if((count($_POST) > 0)){ //Form submitted
	foreach($_POST as $key => $value) {
		$returnedText[$key] = stripslashes($value);
	}
	$errorFound = false;

	$mail_pat = '^(.+)@(.+)$';
	if(!eregi($mail_pat, stripslashes($_POST['email']))) {
		$error['email'] = "Invalid E-mail address";
		$errorFound = true;
	}

	if($_POST['name'] == null) {
		$error['name'] = "Required Field";
		$errorFound = true;
	}

	if($_POST['message'] == null) {
		$error['message'] = "Required Field";
		$errorFound = true;
	}


	if($errorFound != true) {
		//Send the message
		foreach($_POST as $key => $value) {
			$message .= $key.": ".$value."\n\n";
		}
		$result = mail($recipient, $subject, $message, "From: $reply\nReply-To: $reply\nReturn-Path: $reply\nX-Mailer: PHP/" . phpversion(), "-f$reply");
		if($result) {
			$submittedMessage = "Message sent, thank you";	
		}
		
		$returnedText = array();
	}

}

?>

<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="UTF-8">
<title></title>
<link href="/style/style.css" rel="stylesheet" type="text/css" />
<link href="/style/layout.css" rel="stylesheet" type="text/css" />
<script src="/js/jquery-1.4.2.min.js" type="text/javascript"></script>
<script src="/js/cufon-yui.js" type="text/javascript"></script>
<script src="/js/cufon-replace.js" type="text/javascript"></script>
<script type="text/javascript" src="/js/AG_Foreigner_Light-Plain_400.font.js"></script>
<script type="text/javascript" src="/js/Myriad_400-Myriad_700.font.js"></script>
<!--[if lt IE 9]><script src="js/ie9.js" type="text/javascript"></script><![endif]-->
<!--[if lt IE 7]><link href="ie_style.css" rel="stylesheet" type="text/css" /><![endif]-->
<script type="text/javascript" >
function subscribe(address) {
    window.open("http://www.islearning.org/mail/subscribe.php?email="+address,"subViewWin","width=700,height=300,scrollbars");
}
</script> 
<script type="text/javascript">
if(self.location == top.location)
top.location.href = '/index.html?' + escape(self.location); 
</script>
<style type="text/css">
body {
		overflow: hidden;
	font-family:verdana,arial,sans-serif;
	font-size:10pt;
	margin:10px;
	background-color:#ffffff;
	}
</style>
</head>
<body id="page7">

<script type="text/javascript" >
$(document).ready(function() {
	// working entry point
	$(parent.topNav.document).find('li').removeClass('active');
	$(parent.topNav.document).find('#page_contact').addClass('active');
});
</script>
<div id="content">
  <div class="top">
    <div class="bot">
      <div class="wrap">
        <article>
          <section>
            <div class="colum pr">
  				  <h3>Primary Contact</h3>
              <dl class="address">
                <dt><strong> Fynshovedvej 584, DK-5390, Martofte</strong></dt>
                <dd><span>CVR-nr.</span> 26347793</dd>
                <dd><span>Phone:</span> +45 3115 5327</dd>
                <dd><span>E-mail:</span> <a href="mailto:admin@ISLearning.org">admin@ISLearning.org</a></dd>
              </dl>
              <p></p>
  				  <h3>Secondary Contact</h3>
              <dl class="address">
                <dt><strong>Marketing & PR</strong></dt>
                <dd><span>Administration:</span>Louise Williamson</dd>
                <dd><span>Phone:</span> +45 6534 1500</dd>
                <dd><span>E-mail:</span> <a href="mailto:louise@ISLearning.org">louise@ISLearning.org</a></dd>
              </dl>
              <p></p>            
        
            </div>
             <div class="colum2">
          		<div class="sect">
            <h3>contact form</h3>
            <p><?php echo $submittedMessage; ?></p>
            <form action="<?php echo $_SERVER['PHP_SELF']; ?>" id="form1" method="post">
              <fieldset>
                <?php
					if(array_key_exists("name", $error)) {
						print("<label style=\"color: red;\">\n");
					}
					else {
						print("<label>\n");
					}
				?>
                <span>Your name:</span>
                  <input type="text" name="name" value="<?php echo $returnedText['name'] ?>" onclick="this.value=''">
                </label>
                
                <?php
					if(array_key_exists("email", $error)) {
						print("<label style=\"color: red;\">\n");
					}
					else {
						print("<label>\n");
					}
				?>
				<span>Your e-mail:</span>
                  <input type="text" name="email" value="<?php echo $returnedText['email'] ?>" onclick="this.value=''">
                </label>
              </fieldset>
              
              <?php
					if(array_key_exists("message", $error)) {
						print("<label style=\"color: red;\">\n");
					}
					else {
						print("<label>\n");
					}
				?>
				<span>Your message:</span>
                <textarea  name="message" onClick="this.value=''"><?php echo $returnedText['message'] ?></textarea>
              </label>
              <label class="btns"><a href="javascript:document.getElementById('form1').reset()" class="button">Reset</a><a href="javascript:document.getElementById('form1').submit()" class="button">Submit</a><br class="clear"></label>
            </form>
					</div>
				</div>
          </section>
			</article>
        <aside>
           <menu>
         <h1>Frequently asked questions</h1>
            <ul class="und">
               <li><a href="/FAQ/wheredo.html">Where do I start</a></li>              
					<li><a href="/FAQ/whatwill.html">What will I do</a></li>              
              	<li><a href="/FAQ/howlong.html">How long will it take</a></li>
              	<li><a href="/FAQ/howmuch.html">How much will it cost</a></li>
              	<li><a href="/FAQ/isthere.html">Is there any Guarantee</a></li
             </ul>
          </menu>
          <h3>Sign up for our</h3>
          <form action="" id="newsletter">
            <fieldset>
              <h3>newsletter</h3>
              <label><span>
                <input id="address" type="text" value="Enter Your Email" onClick="this.value=''">
              </span></label>
				  <a href="javascript:unsubscribe(document.forms['newsletter'].elements['address'].value);" class="nocolor fleft">Unsubscribe</a>              
              <a href="javascript:subscribe(document.forms['newsletter'].elements['address'].value);" class="button">Submit</a> 
              <br class="clear">
            </fieldset>
          </form>
          <br />
        </aside>
     	</div>
    </div>
  </div>
</div>

<script type="text/javascript"> Cufon.now(); </script>
</body>
</html>
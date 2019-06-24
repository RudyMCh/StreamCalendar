<?php
namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Entity\User;
use App\Entity\Event;
use App\Entity\Activity;
use \DateTime;
use App\Service\Recaptcha;
use App\Service\TokenGenerator;
use App\Repository\UserRepository;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use \Swift_Mailer;
use \Swift_Message;
use App\Form\RegisterType;

class MainController extends AbstractController{
    /**
     * @Route("/", name="home")
     * Page
     */
    public function home(){

        $title = $this->getParameter('site_title');

        return $this->render('index.html.twig', array('title' => $title));
    }

    /**
     * @Route("/mon-calendrier/", name="myCalendar")
     */
    public function myCalendar()
    {
        $session=$this->get('session');
        if(!$session->has('account')){
            throw new NotFoundHttpException('pas identifié');
        }
        if($session->has('account')){
            $type = $session->get('account')->getType();
            if($type < 1){
                throw new NotFoundHttpException('accès non autorisé');
            }else{
                $user = $session->get('account');
                dump($user);
                $um = $this->getDoctrine()->getManager();
                $user=$um->merge($user);
                $activities = $user->getActivity();
                dump($activities);
                $activityList = [];
                foreach($activities as $activity){
                    $activityList[]=$activity->getName();
                }
                dump($activityList);



                return $this->render('myCalendar.html.twig', array("activities" => $activityList));
            }
        }
    }

    /**
     * @Route("/se-connecter/", name="login")
     */
    public function login(Request $request){
        $session = $this->get('session');
        if($session->has('account')){
            return $this->redirectToRoute('home');
            //ou alors
            //throw new AccessDenied
        }else{
            if
            (
                $request->isMethod('post')
            )
            {
                //récupration des données POST
                $email = $request->request->get('email');
                $password = $request->request->get('password');
                if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
                    $errors['email'] =  true;
                }
                if(!preg_match('#^.{8,320}$#i', $password)){
                    $errors['password'] = true;
                }
                if(!isset($errors)){
                    $userRepo = $this->getDoctrine()->getRepository(User::class);
                    $user = $userRepo-> findOneByEmail($email);
                    if(!empty($user)){
                        $passwordVerif = $user->getPassword();
                        if(password_verify($password, $passwordVerif)){
                            if(!$user->getActive()){
                                $errors['inactiveAccount'] = true;
                                return $this->render('login.html.twig', ["errors" => $errors]);
                            }else{
                                $session->set('account', $user);
                                dump($session);
                                return $this->render('login.html.twig', array('success'=>true));
                            }
                        }                        
                    }else{
                        $errors['login']=true;
                    }
                }
            };
        }
        if(isset($errors)){
            return $this->render('login.html.twig', array('errors'=> $errors));
        }else{
            return $this->render('login.html.twig');
        }
    }

    /**
     * @Route("/se-deconnecter/", name="logout")
     */
    public function logout(){
        $session=$this->get('session');
        if($session->has('account')){
            $session->remove('account');
            return $this->render('logout.html.twig');
        }else{
            return $this->redirectToRoute('login');
        }
    }

    /**
     * @Route("/inscription/", name="register")
     */
    public function register(Request $request, Swift_Mailer $mailer){

       
        //vérification si déjà connecté
        $session = $this->get('session');
        if($session->has('account')){
            return $this->redirectToRoute('home');
        }else{

            //récupération des données POST
            $email = $request->request->get('email');
            $name = $request->request->get('name');           
            $password = $request->request->get('password');
            $confirmPassword = $request->request->get('confirmPassword');
            //$reCaptcha = $request->request->get('g-recaptcha-response');
            

            //appel des variables
            if
            (
               $request->isMethod('post')
            )
            {
                //bloc des vérifs
                if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
                    $errors['email'] =  true;
                }
                if(!preg_match('#^.{2,100}$#i', $name)){
                    $errors['name'] = true;
                }
                if(!preg_match('#^.{8,320}$#i', $password)){
                    $errors['password'] = true;
                }
                if($password != $confirmPassword){
                    $errors['confirmPassword'] = true;
                }
                // if(!$recaptcha->isValid($reCaptcha, $request->server->get('REMOTE_ADDR'))){
                //     $errors['reCaptcha'] = true;
                // }
                //traitement si pas d'erreurs
                if(!isset($errors)){
                    //verification si mail déjà utilisé
                    $userRepo = $this->getDoctrine()->getRepository(User::class);
                    $userVerif = $userRepo-> findOneByEmail($email);
                    if(empty($userVerif)){
                        //création d'un nouvel utilisateur
                        $user = new User();
                        $token= md5(rand());
                        //hydratation de $user
                        $user
                            ->setEmail($email)
                            ->setName($name)
                            ->setPassword(password_hash($password, PASSWORD_BCRYPT))
                            ->setActive(false)
                            ->setToken($token)
                            ->setType(0)
                            ->setInProcess(0)

                        ;
                        dump($user);
                        //récupération du manageur des entités
                        $em = $this->getDoctrine()->getManager();
                        $em->persist($user);
                        $em->flush();
                        // $message= (new Swift_Message('mail de confirmation'))
                        //     ->setFrom("nous@gmail.com")
                        //     ->setTo($email)
                        //     ->setBody(
                        //         $this->renderView('emails/HelloWorld.html.twig', array(
                        //             "user" => $user,
                        //         )),
                        //         'text/html'
                        //         )
                        //     ->addPart(
                        //         $this->renderView('emails/HelloWorld.txt.twig', array(
                        //             "user" => $user,
                        //         )),
                        //         'text/plain'
                        //     )
                        // ;
                        // $status = $mailer->send($message);
                        // if($status){
                        //     return $this->render('register.html.twig', array('success' => true));
                        // }else{
                        //     $errors['errorMail'] = true;
                        //     return $this->render('register.html.twig', array('errors' => $errors));
                        // }
                    } else {
                        $errors['alreadyUsed'] = true;
                    }
                }
            };
            if(isset($errors)){
                return $this->render('register.html.twig', array('errors' => $errors));
            } else{
                return $this->render('register.html.twig');
            }
        }
    }

    /**
     * @Route("/extraction", name="extract")
     * 
     * fonction pour extraire les evenements créés par un streamer sur son agenda,
     *  utilisé par javascript fullcalendar fonction events
     */
    public function extract()
    {   
        $session=$this->get('session');
        $user =$session->get('account');
        $eventRepository = $this->getDoctrine()->getRepository(Event::class);
        $events = $eventRepository->findByStreamer($user);
        if(empty($events)){
            return $this->json(['empty' =>true]);
        }else{  
            foreach($events as $event){
                $eventsArray[] = [
                    'id' => $event->getId(),
                    'title' => $event->getTitle(),
                    'description' => $event->getDescription(),
                    'start' => $event->getStart()->format('Y-m-d H:i:s'),
                    'end' => $event->getEnd()->format('Y-m-d H:i:s'),
                    'streamer' => $event->getStreamer()->getId(),
                    'color' => $event->getColor()
                ];

            }
            dump($events);
            dump($eventsArray);
            return $this->json($eventsArray);
        }
    }

    /**
     * @Route("/extractStreamer", name="extractStreamer")
     * 
     * 
     */
    public function extractStreamer(Request $request){
        $name= $request->request->get('name');
        $sr = $this->getDoctrine()->getRepository(User::class);
        $streamer= $sr->findOneByName($name);
        $er= $this->getDoctrine()->getRepository(Event::class);
        $events = $er->findByStreamer($streamer);
        if(empty($events)){
            return $this->json(["success" => false]);
        }else{
            foreach($events as $event){
                $eventsArray[] = [
                    'id' => $event->getId(),
                    'title' => $event->getTitle(),
                    'description' => $event->getDescription(),
                    'start' => $event->getStart()->format('Y-m-d H:i:s'),
                    'end' => $event->getEnd()->format('Y-m-d H:i:s'),
                    'streamer' => $event->getStreamer()->getId()
                ];
            }
            return $this->json($eventsArray);
        }
    }

    /**
     * @Route("/extractFavoritesEvents",name="extractFavoritesEvents" )
     * 
     * fonction pour extraire les evenements de streamer favoris du user actuel, page viewerCalendar
     */
    public function extractFavoritesEvents(){
        $session=$this->get('session');

        $user=$session->get('account');

        $em = $this->getDoctrine()->getManager();

        $user = $em->merge($user);

        dump($user);
        
        $user->getFavorite()->initialize();
        
        dump($user);
        $myStreamers = $user->getFavorite();

        dump($myStreamers);


        if(empty($myStreamers)){
            return $this->json(["empty" => true]);
        }else{
            $eventsUsers = [];
            $er = $this->getDoctrine()->getRepository(Event::class);
            foreach($myStreamers as $streamer){
                $events=$er->findByStreamer($streamer);
                foreach($events as $event){
                    $eventsUsers[] = [
                        'id' => $event->getId(),
                        'title' => $event->getTitle(),
                        'description' => $event->getDescription(),
                        'color' => $event->getColor(),
                        'start' => $event->getStart()->format('Y-m-d H:i:s'),
                        'end' => $event->getEnd()->format('Y-m-d H:i:s'),
                        'streamer' => $event->getStreamer()->getId()
                    ];
                };
            }
            dump($eventsUsers);
            return $this->json($eventsUsers);
        }
    }
    
    /**
     * @Route("/insertion", name="insert")
     * 
     * fonction pour insérer un evenement par un streamer, utilisé par fullcalendar, fonction select, streamcalendar.js
     */
    public function insert(Request $request)
    {
        $session= $this->get('session');
        if($request->isMethod('post')){
            $title = $request->request->get('title');
            $start = $request->request->get('start');
            $end = $request->request->get('end');
            $description = $request->request->get('description');
            if(!preg_match('#^.{1,50}$#i',$title)){
                $errors['title']= true;
            }
            if(!preg_match('#^.{0,1000}$#i', $description)){
                $errors['description']= true;
            }
            if(!preg_match('#^.{1,200}$#', $start)){
                $errors['start']= true;      
            }
            if(!preg_match('#^.{1,200}$#', $end)){
                $errors['end']= true;   
            }

            if(!isset($errors)){
                $user = $session->get('account');
                $id=$user->getId();
                $er = $this->getDoctrine()->getRepository(User::class);
                $streamer = $er->findOneById($id);
                $ar= $this->getDoctrine()->getRepository(Activity::class);
                $activity=$ar->findOneByName($title);
                $color=$activity->getColor();
                $event = new Event();
                $startD = new DateTime($start);
                $endD = new DateTime($end);
                dump($color);
                dump($endD);
                $event
                    ->setTitle($title)
                    ->setDescription($description)
                    ->setStart($startD)
                    ->setEnd($endD)
                    ->setStreamer($streamer)
                    ->setColor($color)
                ;
                $em = $this->getDoctrine()->getManager();
                $em->persist($event);
                $em->flush();
                $success=array("success" => true);
                return $this->json($success);
            }else{
                return $this->json(["errors" =>$errors]);
            }
        }else{
            return $this->json(["errorMethod" => true]);
        }
    }

    /**
     * @Route("/mise-a-jour-deplacement/", name="updateDrop")
     * 
     * 
     * fonction pour mettre à jour en bdd un evenement qui est déplacé sur le calendrier du streamer
     * utilisé par fullcalendar, fonction eventDrop
    */
    public function updateDrop(Request $request){
        if($request->isMethod("POST")){
            $publicId= $request->request->get('publicId');
            $start= new DateTime($request->request->get('start'));
            $end= new DateTime($request->request->get('end'));
            $er= $this->getDoctrine()->getRepository(Event::class);
            $event = $er->findOneById($publicId);
            dump($event);
            $event->setStart($start)->setEnd($end);

            $em= $this->getDoctrine()->getManager();
            $em->flush();
            

        return $this->json(["success" => true]);
        }else{
            return $this->json(['error' =>true]);
        }
    }

    /**
     * @Route("/mise-a-jour-resize/", name="updateResize")
     * 
     * fonction pour mettre à jour un evenement quand sa durée est modifiée
     * utilisée par fullcalendar, fonction eventresize
    */
    public function updateResize(Request $request){
        if($request->isMethod("POST")){
            //récupréation des données envoyé par la requête AJAX
            $publicId = $request->request->get('publicId');
            $end = new DateTime($request->request->get('end'));
            //appel de l'objet event coorespondant à la modification
            $er= $this->getDoctrine()->getRepository(Event::class);
            $event = $er->findOneById($publicId);
            //hydratation de la nouvelle fin de l'évênement
            $event->setEnd($end);
            //appel du manager et enregistrement en bdd
            $em= $this->getDoctrine()->getManager();
            $em->flush();
            //renvoi du message de succès en JSON
            return $this->json(["success" => true]);
        }else{
            return $this->json(["success" => false]);
        }
    }

    /**
     * @Route("/supprimer-un-evenement/", name="deleteEvent")
     * 
     * fonction pour supprimer un evenement, utilisée par fullcalendar, fonction eventClick
     */
    public function deleteEvent(Request $request){
        if($request->isMethod("POST")){
            //récupréation des données envoyé par la requête AJAX
            $publicId = $request->request->get('publicId');
            $er=$this->getDoctrine()->getRepository(Event::class);
            $event=$er->findOneById($publicId);
            dump($publicId);
            dump($event);
            $em = $this->getDoctrine()->getManager();
            $em->remove($event);
            $em->flush();
            return $this->json(["success" => true]);
        }
    }

    /**
     * @Route("/mon-calendrier-viewer/", name="viewerCalendar")
     */
    public function viewerCalendar(){
    $session= $this->get('session');
    if(!$session->has('account')){
    return $this->redirectToRoute('login');
    }
    // we fetch ourself !
    $user = $session->get('account');
    $em = $this->getDoctrine()->getManager();
    $user = $em->merge($user);
    // we fetch and load the favorite streamers list for further sending to the view
    $favStream = $user->getFavorite();

    return $this->render('viewerCalendar.html.twig', array("favStream" => $favStream));
    
    }

    /**
     * @Route("/mon-profil-viewer/", name="viewerProfile")
     */
    public function viewerProfile(Request $request){
        $session= $this->get('session');
        if(!$session->has('account')){
            return $this->redirectToRoute('login');
        }
                
        //listing out all variables
        if ($request->isMethod('post')) {
            $name = $request->request->get('name');
            $email = $request->request->get('email');
            //verifications
            if(!preg_match('#^.{2,100}$#i', $name)){
                $errors['name'] = true;
            }
            if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
                $errors['email'] = true;
            }
            //if no error
            if(!isset($errors)){
                $userVerif = $er->findOneByEmail($email); // we check ou whether or not the email is already existing
                $em = $this->getDoctrine()->getManager();
                $user = $this->get('session')->get('account');
                $user = $em->merge($user);              // we fetch the connected user
                if(empty($userVerif)){  // if the email wasn't existing so we can modify it
                    $user->setEmail($email);
                } else {
                    $errors['alreadyUsed'] = true;
                }
                $user->setName($name);  // in any case we modify the name
                // then we save values in the database and we update session variables
                $em->flush();
                $session->set('account', $user);
            }
            if(isset($errors)){
                return $this->render('viewerProfile.html.twig', array('errors' => $errors));
            } else {
                return $this->render('viewerProfile.html.twig');
            }
        }
        return $this->render('viewerProfile.html.twig');
    }

    /**
     * @Route("/viewer-favoris-streamers/", name="viewerFavStream")
     * page for managing the favorites streamers
     */
    public function viewerFavStream(Request $request){
        $session= $this->get('session');
        if(!$session->has('account')){
            return $this->redirectToRoute('login');
        }
        // we fetch all streamers from the database (type = 1)
        $er = $this->getDoctrine()->getRepository(User::class);
        $streamers = $er->findByType(1);

        // we load the list for further sending to the view for typeahead feature
        foreach ($streamers as $streamer){
            $list[] = $streamer->getName();
        }
        //listing out all variables
        if ($request->isMethod('post')) {
            $name = $request->request->get('name');
            //verifications
            if(!preg_match('#^.{2,100}$#i', $name)){
                $errors['name'] = true;
            }
            //if no error
            if(!isset($errors)){
                $str=$er->findOneByName($name);
                // if favorite was found so we save it in the database
                if (!empty($str)) {
                    $user = $session->get('account');
                    $em = $this->getDoctrine()->getManager();
                    $user = $em->merge($user); // we make a merge because user is coming out from the session and is not fully understood 
                    $user->addFavorite($str);
                    $em->flush();
                    dump($user);
                    dump($str);
                    return $this->render('viewerFavStream.html.twig', ['success'=>true, 'streamerList' => $list]);
                } else {
                    $errors['notexist']=true;
                    return $this->render('viewerFavStream.html.twig', ['errors'=> $errors, 'streamerList' => $list]);
                }
            }
            if(isset($errors)){
                return $this->render('viewerFavStream.html.twig', array('errors' => $errors, 'streamerList' => $list));
            } else {
                return $this->render('viewerFavStream.html.twig', array("streamerList" => $list));
            }
        }
        return $this->render('viewerFavStream.html.twig', array("streamerList" => $list));
    }
    
    /**
     * @Route("/mon-profil-streamer/", name="streamerProfil")
     */
    public function streamerProfil(Request $request){
        //verif session
        $session = $this->get('session');
        if(!$session->has('account') || $session->get('account')->getType()<1){
            throw new NotFoundHttpException('non autorisé'); 
        }else{
            //si session, on force l'hydratation de user pour récupérer sa collection d'activité favorite pour lui proposer
            // un choix restraint et pour attribuer une couleur à ses activités
            $user = $session->get('account');
            $um= $this->getDoctrine()->getManager();
            $user=$um->merge($user);
            $ar = $this->getDoctrine()->getRepository(Activity::class);
            $activities = $ar->findAll();
            $activityList = [];
            foreach($activities as $activity){
                $activityList[]=$activity->getName();
            }
            dump($activityList);
            if($request->isMethod('POST')){
                //enregistrement de l'activité choisie dans la page profil
                $activityChosen = $request->request->get('activity');
                dump($activityChosen);
                //verif de $activityChosen dans activityList à faire!!!!!!!!
                if(!isset($errors)){
                    $activityRegistered = $ar->findOneByName($activityChosen);
                    dump($activityRegistered);
                    $user->addActivity($activityRegistered);
                    $um->flush();
                }
            }
        }
        return $this->render('streamerProfil.html.twig', array(
            "activity" => $user->getActivity(),
            "name" => $user->getName(),
            "twhitchId" => $user->getTwitchId(),
            "imgProfil" => str_replace("{width}x{height}", "100x100",$user->getProfilImage()),
            "activityList" => $activityList
        ));
    
    }

    

    /**
     * @Route("/administration-backend/", name="adminBackend")
     */
    public function adminBackend(Request $request, Swift_Mailer $mailer){

        //     //vérification si déjà connecté
        //     $session = $this->get('session');
    
        //     if(!$session->has('account')){
        //         return $this->redirectToRoute('login');
    
        //     }
        //     if($session->has('account')){
        //         $type = $session->get('account')->getType();
        //         if($type!=2){
        //             throw new NotFoundHttpException('accès non autorisé');
        //         }else{
        //             return $this->render('adminBackend.html.twig');
        //         }
        //     }
    
        //    // return $this->render('adminBackend.html.twig');
        // //}
    
        // // /**
        // //  * @Route("/admin-maj-game", name="updateGames")
        // //  */
        // // public function updateGames(Request $request)
        // //{
        //     //vérification si déjà connecté
        //     //$session= $this->get('session');
        //     //$user =$session->get('account');
            
        //     // Récupération données JSON
        //     $gameRepo = $this->getDoctrine()->getRepository(Activity::class);
        //     $games = $gameRepository->findById($twitch_code);
        //     if(empty($games)){
        //         return $this->json(['empty' =>true]);
        //     }else{ 
        //         foreach($games as $game){
        //             $gamesArray[] = [
        //                 'data.data.id' => $game->getId(),
        //                 'data.data.name' => $game->getName(),
        //                 'data.data.box_art_url' => $game->getGame_image()
        //             ];
        //         }
        //         var_dump(json_decode($gamesArray));
        //         return $this->json($gamesArray);
        //         dump(json_decode($game));
        //     }
        //     // appel des variables
        //     if($request->isMethod('post')){
            
        //         // Récupération données post
        //         $twitch_code = $request->request->get('id');
        //         $name = $request->request->get('name');
        //         $game_image = $request->request->get('box_art_url');
                
        //         if(!preg_match('#^[0-9]{1,20}$#i',$twitch_code)){
        //             $errors['id']= true;
        //         }
        //         if(!preg_match('#^.{2,255}$#i',$name)){
        //             $errors['name']= true;
        //         }
        //         if(!preg_match('#^.{2,350}$#i',$game_image)){
        //             $errors['box_art_url']= true;
        //         }
                
        //         // Si pas d'erreurs
        //         if(!isset($errors)){
    
        //         // Verif si existe pas
        //         $gameRepo = $this->getDoctrine()->getRepository(Activity::class);
    
        //         $gamesIfExist = $gameRepo->findById($twitch_code);
    
        //         if(empty($gamesIfExist)){
    
        //             // Création d'un nouveau jeu
        //             $newGames = new Activity();
        //             // on hydrate $newGames
        //             $newGames
        //                 ->setId($twitch_code)
        //                 ->setName($name)
        //                 ->setBox_art_url($game_image)
        //             ;
        //             // Récupération du manager des entités
        //             $em = $this->getDoctrine()->getManager();
        //             $em->merge($newGames);
        //             $em->flush();
        //         }
        //     }
        //     return $this->json(["success" => true]);
        // } else {
        //     return $this->json(["success" => false]);
        // } 
    }
    
    /**
     * @Route("/record-favorite/", name="recordFavorite")
     */
    public function recordFavorite(Request $request){

        if ($request->isMethod('post')) {
            $session=$this->get('session');
            $name=$request->request->get('name');
            $userMyself = $session->get('account');
            $ur=$this->getDoctrine()->getRepository(User::class);
            $user=$ur->findOneByName($name);
            $userMyself->addFavorite($user);
            $this->getDoctrine()->getManager()->flush();
            return $this->json(["success" => true]);


        }



    }

}
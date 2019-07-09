<?php
namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class AppExtension extends AbstractExtension {
    /**
     * filtres pour twig
     */
    public function getFilters(){
        return array(
            new TwigFilter('resizeImg',array(
                $this, 'resizeImg'
            ))
            );
    }

    /**
     * filtre excerpt qui raccourci la chaîne de caractères à 30
     */
    public function resizeImg ($str){
        
        return str_replace("{width}x{height}", "200x200", $str);
    }
}